import { FlexProps } from "@chakra-ui/core";
import { useRef, useState } from "react";

import { DraggableList } from "@/components/layout/DraggableList";
import { API_ROUTES } from "@/config/api";
import { getHashCode, mapOrder } from "@/functions/utils";
import { useSelection } from "@/hooks/array/useSelection";

import { Dropzone } from "./Dropzone";
import { ImageItem } from "./ImageItem";

type ImageUploaderProps = FlexProps & {
    onUploadComplete?: (results: UploadResults[]) => void;
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

    // Holds the index order
    const order = useRef([]);

    // Upload results
    const [results, setResults] = useState<UploadResults>({});

    // Add new result, add the index to the order array & update ordered results array
    const onComplete = (result: UploadResult) => {
        const updatedResults = { ...results, [getFileId(result.file)]: result };
        setResults(updatedResults);

        const updatedOrder = [...order.current, order.current.length];
        order.current = updatedOrder;
        onOrderChange(updatedOrder, updatedResults);
    };

    // Checks if upload is complete, if so, send ordered results
    const onOrderChange = (updatedOrder: number[], results: UploadResults) => {
        const isUploadComplete = files.length && files.length === Object.keys(results).length;
        if (isUploadComplete) {
            const orderedResults = mapOrder(Object.values(results), updatedOrder, "index");
            onUploadComplete(orderedResults);
        }
    };

    // Add new files to selection
    const handleFileChange = async (changedFiles: File[]) => {
        const newFiles = changedFiles.filter((file) => !selection.find(file));
        if (newFiles.length) {
            selection.add(newFiles);
        }
    };

    // Re-order on change
    const handleOrderChange = (newOrder: number[]) => {
        order.current = newOrder;
        onOrderChange(newOrder, results);
    };

    const url = useChunks ? API_ROUTES.Upload.chunks : API_ROUTES.Upload.img;
    const uploadOptions = useChunks ? { useChunks, chunkSize: 330 } : { fieldKey: "image" };

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
            <DraggableList getId={(props) => getFileId(props.file)} onOrderChange={handleOrderChange} width="100%">
                {files.map((item, index) => (
                    <ImageItem key={index} file={item} result={results[getFileId(item)]} {...itemProps} index={index} />
                ))}
            </DraggableList>
        </Dropzone>
    );
}
