import { Box, Button, Flex, FormLabel, Stack, Switch, useToast } from "@chakra-ui/core";
import { ChangeEvent, EventHandler, useCallback, useState } from "react";

import { ImageUploader, UploadResult } from "@/components/field/ImageUploader/ImageUploader";
import { TagsAutocomplete } from "@/components/modules/tag/TagsAutocomplete";
import { useRequestAPI } from "@/hooks/async/useAPI";
import { useAuth } from "@/hooks/async/useAuth";
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

    const handleSelectedTags = (selectedTags: ElasticDocument[]) => actions.set("tags", selectedTags.map(formatTags));
    const handleUploadResults = (results: UploadResult[]) => actions.set("pictures", results.map(getPictureId));
    const handleVisibility: EventHandler<ChangeEvent> = (e) =>
        actions.set("visibility", (e.target as HTMLInputElement).checked ? Visibility.PUBLIC : Visibility.PRIVATE);
    const handleSubmit = useCallback(actions.onSubmit(onSubmit), []);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <ImageUploader onUploadComplete={handleUploadResults} multiple mb={"20px"} />
                <TagsAutocomplete setSelecteds={handleSelectedTags} />
                <Flex align="center" mt="10px">
                    <FormLabel>Is public ?</FormLabel>
                    <Switch defaultIsChecked onChange={handleVisibility} />
                </Flex>
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
    const { user, isTokenValid } = useAuth();
    const [async, run] = useRequestAPI<MemeResponse>("/memes/", { method: "post" }, { withToken: isTokenValid });
    const [key, setKey] = useState(0);

    const toast = useToast();

    const onSubmit: FormSubmitCallback<MemeFormState> = async ({ state: { data }, actions, e }) => {
        e.preventDefault();
        const payload = {
            visibility: Visibility.PUBLIC,
            ...data,
            owner: user && user.id,
        };

        if (!data.pictures.length || !data.tags.length) {
            return;
        }

        const [err, result] = await run(payload);
        toast({
            title: err ? "There was an error" : "Meme successfully posted.",
            description: err && err.message,
            status: err ? "error" : "success",
            duration: 2000,
            isClosable: true,
        });
        if (!err) {
            setKey(key + 1);
        } else {
            actions.addError(err.message, "form");
        }
        console.log(payload, err, result);
    };

    return <MemeFormTemplate onSubmit={onSubmit} isLoading={async.isLoading} key={key} />;
}

// Fix Chakra-UI typing mistake
// const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

const getPictureId = (result: UploadResult<IImage>) => result.data && result.data.id;
const formatTags = (tag: ElasticDocument) => ({ tag: tag.text.toLowerCase(), id: tag._id });
