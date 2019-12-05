import {
    Box, Button, Flex, FlexProps, Input, InputProps, Text, useColorMode
} from "@chakra-ui/core";
import { ChangeEvent, DragEvent, MouseEvent, useRef, useState } from "react";
import { IoMdCloudUpload } from "react-icons/io";

import { wrapEvent } from "@/functions/utils";

type DropzoneInputEvents = Pick<
    InputProps,
    "onDragOver" | "onDragLeave" | "onDrop" | "onClick" | "isDisabled" | "multiple"
>;
export type DropzoneProps = FlexProps &
    DropzoneInputEvents & {
        hasFiles: boolean;
        onFilesChange: (files: File[]) => void;
        maxSelected?: number;
        maxFileSize?: number;
        shouldDisplayMaxSelected?: boolean;
    };

export function Dropzone({
    hasFiles,
    onFilesChange,
    maxSelected,
    maxFileSize,
    shouldDisplayMaxSelected,
    ...props
}: DropzoneProps) {
    const { colorMode } = useColorMode();
    const outline = colorMode === "light" ? "5px dashed rgba(0, 0, 0, 0.2)" : "5px dashed rgba(255, 255, 255, 0.2)";

    // Native Input props
    const { onDragOver, onDragLeave, onDrop, onClick, isDisabled, multiple, children, ...rest } = props;

    const inputRef = useRef(null);

    // Highlight dropzone on drag over
    const [isHighlighted, setHighlighted] = useState(false);

    const handleDragOver = wrapEvent(onDragOver, (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (isDisabled) {
            return;
        }

        setHighlighted(true);
    });

    const handleDragLeave = wrapEvent(onDragLeave, (event: DragEvent<HTMLElement>) => {
        setHighlighted(false);
    });

    const openDialog = wrapEvent(onClick, (event: MouseEvent<HTMLElement>) => {
        if (isDisabled) {
            return;
        }

        inputRef.current.click();
    });

    const handleDrop = wrapEvent(onDrop, (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (isDisabled) {
            return;
        }

        setHighlighted(false);

        const files = fileListToArray(event.dataTransfer.files, maxSelected, maxFileSize);
        onFilesChange(files);
    });

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const files = fileListToArray(event.target.files, maxSelected, maxFileSize);
        if (!files.length) {
            return;
        }

        onFilesChange(files);

        // Fix chrome bug where selecting twice the same file would not trigger changeEvent
        event.target.value = null;
    };

    return (
        <Flex
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            align="center"
            justify="center"
            direction="column"
            paddingY="10px"
            bg={isHighlighted ? "rgb(188, 185, 236)" : null}
            outline={!hasFiles && outline}
            {...rest}
        >
            <Input
                display="none"
                type="file"
                ref={inputRef}
                accept="image/*"
                onChange={handleFile}
                multiple={multiple}
            />
            {children}
            {hasFiles ? (
                !isDisabled ? (
                    <Button mt="10px" fontSize="13px" onClick={openDialog} isFullWidth>
                        Add more
                    </Button>
                ) : (
                    shouldDisplayMaxSelected && (
                        <Text mt="10px" fontSize="13px">
                            Max selected
                        </Text>
                    )
                )
            ) : (
                <Flex direction="column" align="center" onClick={openDialog}>
                    <Text fontSize="16px">No files yet.</Text>
                    <Box as={IoMdCloudUpload} size="36px" />
                    <Button fontSize="13px">Click or drop files here</Button>
                </Flex>
            )}
        </Flex>
    );
}

function fileListToArray(list: FileList, maxSelected?: number, maxSizeMb?: number) {
    const array = [];
    for (let i = 0; i < list.length; i++) {
        if (maxSizeMb && list[i].size >= 1024 * 1024 * maxSizeMb) {
            continue;
        }

        array.push(list[i]);

        if (array.length >= maxSelected) {
            break;
        }
    }

    return array;
}
