import { Box, Button, Stack, Switch as ChakraSwitch, SwitchProps } from "@chakra-ui/core";
import { FormEvent, FunctionComponent, useContext } from "react";

import { ImageUploader, UploadResult } from "@/components/field/ImageUploader/ImageUploader";
import { TagsAutocomplete } from "@/components/field/TagsAutocomplete";
import { useAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { FormState, useForm } from "@/hooks/form/useForm";
import { IImage } from "@/types/entities/Image";
import { Visibility } from "@/types/entities/Visibility";
import { MemeBody, MemeResponse } from "@/types/routes/memes";

type MemeFormState = Pick<MemeBody, "tags" | "pictures">;

export function MemeFormTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm<MemeFormState>({ tags: [], pictures: [] });
    const handleSubmit = (event: FormEvent) => onSubmit(form);

    const handleSelectedTags = (selectedTags: ElasticDocument[]) => actions.set("tags", selectedTags.map(forrmatTags));
    const handleUploadResults = (results: UploadResult[]) => actions.set("pictures", results.map(getPictureId));

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <ImageUploader onUploadComplete={handleUploadResults} multiple mb={"20px"} />
                <TagsAutocomplete mt="10px" setSelecteds={handleSelectedTags} />
            </Stack>
            <Button mt={4} variantColor="blue" isFullWidth variant="outline" isLoading={isLoading} type="submit">
                Post
            </Button>
        </Box>
    );
}

export function MemeForm() {
    const [async, run] = useAPI<MemeResponse, MemeBody>("/memes/", null, { method: "post" });
    const { user } = useContext(AuthContext);

    const onSubmit = async (form: FormState<MemeFormState>) => {
        event.preventDefault();
        const payload = {
            ...form.fields,
            owner: user && user.id,
            visibility: Visibility.PUBLIC,
        };

        if (!form.fields.pictures.length || !form.fields.tags.length) {
            return;
        }

        const [err, result] = await run(payload);
        console.log(form.fields, result);
    };

    return <MemeFormTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}

// Fix Chakra-UI typing mistake
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

const getPictureId = (result: UploadResult<IImage>) => result.data && result.data.id;
const forrmatTags = (tag: ElasticDocument) => ({ tag: tag.text, id: tag._id });
