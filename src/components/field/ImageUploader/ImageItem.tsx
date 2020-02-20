import { Box, ButtonGroup, Flex, Stack, Text, useColorMode } from "@chakra-ui/core";
import { useEffect } from "react";
import {
    IoMdClose, IoMdCloudUpload, IoMdCrop, IoMdRefresh, IoMdRemove, IoMdTrash
} from "react-icons/io";

import { ActionBtn } from "@/components/buttons/ActionBtn";
import { CustomImage } from "@/components/common/CustomImage";
import { FullscreenModal } from "@/components/layout/Modal/FullscreenModal";
import { API_ROUTES } from "@/config/api";
import { round } from "@/functions/utils";
import { useRequestAPI } from "@/hooks/async/useAPI";
import { useAsync, UseAsyncState } from "@/hooks/async/useAsync";
import { useUpload, UseUploadOptions } from "@/hooks/async/useUpload";
import { useToggle } from "@/hooks/useToggle";
import { resizeImg } from "@/services/ImgResizer";
import { IImage } from "@/types/entities/Image";

import { ImageCropper } from "./ImageCropper";
import { UploadResult } from "./ImageUploader";

export type ImageItemProps = {
    index: number;
    file: File;
    result: UploadResult<IImage>;
    url: string;
    isManual?: boolean;
    uploadOptions: UseUploadOptions;
    onComplete: (result: UploadResult<IImage>) => void;
    onRemove: (file: File) => void;
};

const getImgThumbnail = async (file: File) => {
    const [reader, dataUrl] = await resizeImg({ file, maxWidth: 135, maxHeight: 155, forceProportion: false });

    return { reader, dataUrl };
};
const fileResultInChunks = (chunkResult: UseAsyncState) => chunkResult.data && chunkResult.data !== "OK";
const getRoundedCropData = (cropData: Cropper.Data) => {
    const rounded: Record<string, number> = {};
    Object.keys(cropData).forEach((key) => (rounded[key] = Math.round(cropData[key as keyof Cropper.Data])));
    return rounded;
};

export function ImageItem({
    index,
    file,
    result,
    url,
    isManual,
    uploadOptions,
    onComplete,
    onRemove,
    ...props
}: ImageItemProps) {
    const { colorMode } = useColorMode();

    const shouldUpload = file.name && (result ? result.file.name !== file.name : true);
    const [lastReq, upload, uploadState, cancel] = useUpload<IImage>(url, file, uploadOptions, {
        onTrigger: shouldUpload,
        initialData: result ? result.data : undefined,
    });

    const { isComplete, fileProgress } = uploadState;
    const hasProgress = fileProgress !== undefined;
    const displayedProgress = hasProgress ? round(fileProgress) : 0;

    const [thumbnail] = useAsync({ actionFn: () => getImgThumbnail(file), onTrigger: file.name });
    const [cropReq, crop] = useRequestAPI<IImage>(API_ROUTES.Upload.crop, { method: "post" });

    const dataUrl = cropReq.data ? cropReq.data.url + "?t=" + Date.now() : thumbnail.data ? thumbnail.data.dataUrl : "";
    const cropData = cropReq.data && cropReq.data.cropData;

    const [isPreviewOpen, { open, close }] = useToggle();
    const imgSrc = cropReq.data
        ? cropReq.data.url + "?t=" + Date.now()
        : thumbnail.data && thumbnail.data.reader.result;

    // On upload complete
    useEffect(() => {
        if (isComplete && !result) {
            let data, error;
            if (!lastReq.error && uploadOptions.useChunks) {
                const resultWithData = uploadState.completeChunks.find(fileResultInChunks);
                data = resultWithData && resultWithData.data;
                error = uploadState.wasCanceled && new Error();
            } else {
                data = lastReq.data;
                error = lastReq.error;
            }
            onComplete({ data, error, file, index });
        }
    }, [isComplete]);

    // Cancel upload & remove file from selection
    const handleRemove = () => {
        cancel();
        onRemove(file);
    };

    const hasError =
        result &&
        (!uploadOptions.useChunks ? result.error : Array.isArray(result.error) ? result.error.length : result.error);

    const handleCrop = async (cropData: Cropper.Data) => {
        const id = result.data.parent || result.data.id;
        // If user already cropped the image once, update cropped entity rather than creating another
        const croppedId = cropReq.data && cropReq.data.id;

        const [error, data] = await crop({ id, cropData: getRoundedCropData(cropData), croppedId });
        onComplete({ data, error, file, index });
    };

    const borderBottomColor = colorMode === "light" ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)";

    return (
        <Flex w="100%" paddingY="10px" borderBottom="1px" borderBottomColor={borderBottomColor} {...props}>
            {dataUrl ? (
                <>
                    <CustomImage
                        onClick={open}
                        width="135px"
                        maxH="155px"
                        objectFit="contain"
                        src={dataUrl}
                        mr="auto"
                    />
                    <FullscreenModal isOpen={isPreviewOpen} close={close}>
                        <CustomImage objectFit="contain" w="100%" src={imgSrc as string} />
                    </FullscreenModal>
                </>
            ) : (
                <Box width="135px"></Box>
            )}
            <Flex padding="10px" pb="0" direction="column">
                <Text fontSize="14px">
                    {getName(file.name)} ({getFileSize(file.size)})
                </Text>
                <Flex align="center" mt="auto">
                    {hasProgress && <Text fontSize="12px">{displayedProgress}%</Text>}
                    <Stack direction="row" ml="auto" mb="8px" spacing="8px">
                        {!result ? (
                            !hasProgress ? (
                                <ButtonGroup spacing="8px">
                                    {isManual && (
                                        <ActionBtn label="Upload" icon={IoMdCloudUpload} onClick={() => upload(file)} />
                                    )}
                                    <ActionBtn label="Remove" icon={IoMdRemove} onClick={handleRemove} />
                                </ButtonGroup>
                            ) : (
                                <ActionBtn label="Cancel" icon={IoMdClose} onClick={() => cancel()} />
                            )
                        ) : !hasError ? (
                            thumbnail.data ? (
                                <ButtonGroup spacing="8px">
                                    <ImageCropper
                                        src={thumbnail.data.reader.result as string}
                                        cropData={cropData}
                                        render={(open) => (
                                            <ActionBtn label="Edit" icon={IoMdCrop} onClick={open} mr="8px" />
                                        )}
                                        onCrop={handleCrop}
                                    />

                                    <ActionBtn label="Delete" icon={IoMdTrash} onClick={handleRemove} />
                                </ButtonGroup>
                            ) : null
                        ) : (
                            <ActionBtn label="Retry" icon={IoMdRefresh} onClick={() => upload(file)} />
                        )}
                    </Stack>
                </Flex>
            </Flex>
        </Flex>
    );
}

function getFileSize(size: number) {
    if (size < 1024) {
        return size + " octets";
    } else if (size >= 1024 && size < 1048576) {
        return (size / 1024).toFixed(1) + " Ko";
    } else if (size >= 1048576) {
        return (size / 1048576).toFixed(1) + " Mo";
    }
}

function getName(name: string) {
    let str = name;
    if (name.length > 22) {
        str = str.substr(0, 14) + "..." + str.substr(-5, 8);
    }

    return str;
}
