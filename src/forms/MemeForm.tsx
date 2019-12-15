import { Box, Button, Stack, Switch as ChakraSwitch, SwitchProps } from "@chakra-ui/core";
import { FunctionComponent, useCallback, useContext } from "react";

import { ImageUploader, UploadResult } from "@/components/field/ImageUploader/ImageUploader";
import { TagsAutocomplete } from "@/components/field/TagsAutocomplete";
import { useAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { FormSubmitCallback, useForm } from "@/hooks/form/useForm";
import { IImage } from "@/types/entities/Image";
import { Visibility } from "@/types/entities/Visibility";
import { MemeBody, MemeResponse } from "@/types/routes/memes";

type MemeFormState = Pick<MemeBody, "tags" | "pictures">;

export function MemeFormTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm<MemeFormState>(
        { tags: [], pictures: [] },
        { tags: (selecteds) => selecteds.length > 0, pictures: (selecteds) => selecteds.length > 0 }
    );

    const handleSelectedTags = (selectedTags: ElasticDocument[]) => actions.set("tags", selectedTags.map(forrmatTags));
    const handleUploadResults = (results: UploadResult[]) => actions.set("pictures", results.map(getPictureId));
    const handleSubmit = useCallback(actions.onSubmit(onSubmit), []);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <ImageUploader onUploadComplete={handleUploadResults} multiple mb={"20px"} />
                <TagsAutocomplete setSelecteds={handleSelectedTags} />
            </Stack>
            <Button
                type="submit"
                mt={4}
                variantColor="blue"
                isFullWidth
                variant="outline"
                isLoading={isLoading}
                isDisabled={!form.isValid}
            >
                Post
            </Button>
        </Box>
    );
}

export function MemeForm() {
    const [async, run] = useAPI<MemeResponse, MemeBody>("/memes/", null, { method: "post" });
    const { user } = useContext(AuthContext);

    const onSubmit: FormSubmitCallback<MemeFormState> = async (data, e) => {
        console.log(e);
        e.preventDefault();
        const payload = {
            ...data,
            owner: user && user.id,
            visibility: Visibility.PUBLIC,
        };

        if (!data.pictures.length || !data.tags.length) {
            return;
        }

        const [err, result] = await run(payload);
        console.log(data, result);
    };

    return <MemeFormTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}

// Fix Chakra-UI typing mistake
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

const getPictureId = (result: UploadResult<IImage>) => result.data && result.data.id;
const forrmatTags = (tag: ElasticDocument) => ({ tag: tag.text, id: tag._id });
