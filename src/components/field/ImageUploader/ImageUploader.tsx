import { Flex, FlexProps } from "@chakra-ui/core";
import { useEffect, useState } from "react";

import { API_ROUTES } from "@/config/api";
import { getHashCode } from "@/functions/utils";
import { useSelection } from "@/hooks/array/useSelection";

import { Dropzone } from "./Dropzone";
import { ImageItem } from "./ImageItem";

type ImageUploaderProps = FlexProps & {
    onUploadComplete?: (results: UploadResult[]) => void;
    isDisabled?: boolean;
    multiple?: boolean;
    useChunks?: boolean;
    maxSelected?: number;
    maxFileSize?: number;
};

export type UploadResult<Data = any> = {
    data: Data;
    error: string | Error | Array<string | Error>;
    file: File;
    index: number;
};
export type UploadResults<Data = any> = Record<number, UploadResult<Data>>;
export const getFileId = (file: File) => getHashCode(file.name + file.size);

export function ImageUploader({
    onUploadComplete,
    isDisabled,
    multiple = true,
    useChunks = true,
    maxSelected = 4,
    maxFileSize = 8,
    ...props
}: ImageUploaderProps) {
    // Files to upload
    const [files, selection] = useSelection<File>({ getId: (item) => item.name, max: 4 });

    // Upload results
    const [results, setResults] = useState<UploadResults>({});

    // Add new result
    const onComplete = (result: UploadResult) => setResults({ ...results, [getFileId(result.file)]: result });

    // Checks if upload is complete
    useEffect(() => {
        const isUploadComplete = files.length && files.map(getFileId).every((id) => results[id]?.data?.id);
        if (isUploadComplete) {
            onUploadComplete(files.map(getFileId).map((id) => results[id]));
        }
    }, [results]);

    // Add new files to selection
    const handleFileChange = async (changedFiles: File[]) => {
        const newFiles = changedFiles.filter((file) => !selection.find(file));
        if (newFiles.length) {
            selection.add(newFiles);
        }
    };

    const url = useChunks ? API_ROUTES.Upload.chunks : API_ROUTES.Upload.img;
    const uploadOptions = useChunks ? { useChunks, chunkSize: 500 } : { fieldKey: "image" };

    const itemProps = { url, onComplete, onRemove: selection.remove, uploadOptions };
    const dropzoneProps = { maxSelected, maxFileSize, multiple, isDisabled: isDisabled || files.length >= maxSelected };

    return (
        <Dropzone
            hasFiles={files.length > 0}
            onFilesChange={handleFileChange}
            paddingY={files.length ? 0 : "30px"}
            {...dropzoneProps}
            {...props}
        >
            <Flex direction="column" width="100%">
                {files.map((item, index) => (
                    <ImageItem key={index} file={item} result={results[getFileId(item)]} {...itemProps} index={index} />
                ))}
            </Flex>
        </Dropzone>
    );
}
