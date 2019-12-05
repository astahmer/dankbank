import "cropperjs/dist/cropper.min.css";

import { Button, ButtonProps, Flex } from "@chakra-ui/core";
import Cropper from "cropperjs";
import { useCallback, useRef } from "react";

import { FullscreenModal } from "@/components/layout/Modal/FullscreenModal";
import { useToggle } from "@/hooks/useToggle";

const ignoredActions = ["crop", "move", "zoom"];

type ImageCropperProps = Omit<ButtonProps, "children"> & {
    src: string;
    cropData?: Cropper.Data;
    onCrop?: (cropData: Cropper.Data) => void;
} & Optional<RenderProp<() => void>> &
    Optional<ChildrenProp>;

export function ImageCropper({ src, cropData, onCrop, render, ...props }: ImageCropperProps) {
    const [isOpen, { open, close }] = useToggle();

    const cropperRef = useRef<Cropper>(null);
    const previousCropbox = useRef<Cropper.CropBoxData>(null);
    const reset = () => cropperRef.current.reset();
    const handleCrop = () => {
        onCrop(cropperRef.current.getData());
        close();
    };

    const makeCropper = useCallback(
        (node) => {
            if (node && node instanceof Node) {
                cropperRef.current = new Cropper(node as HTMLImageElement, {
                    viewMode: 1,
                    dragMode: "move",
                    cropBoxMovable: false,
                    wheelZoomRatio: 0.3,
                    autoCropArea: 1,
                    background: true,
                    data: cropData,
                });

                node.addEventListener("cropstart", (event: CustomEvent) => {
                    previousCropbox.current = cropperRef.current.getCropBoxData();
                });
                node.addEventListener("cropend", (event: CustomEvent) => {
                    if (ignoredActions.includes(event.detail.action)) {
                        return;
                    }

                    event.preventDefault();

                    const cropBoxData = cropperRef.current.getCropBoxData();
                    const containerData = cropperRef.current.getContainerData();
                    const canvasData = cropperRef.current.getCanvasData();

                    const resizeRatio = cropBoxData.width / previousCropbox.current.width;
                    const isZoomingIn = resizeRatio < 1;

                    const zoomRatio = canvasData.width / canvasData.naturalWidth;
                    const cropboxRatio = cropBoxData.width / containerData.width;
                    const updatedZoomRatio = isZoomingIn ? zoomRatio / cropboxRatio : zoomRatio / resizeRatio;

                    const action = event.detail.action;
                    const cropboxCenter = {
                        x: cropBoxData.left + (action.includes("w") ? cropBoxData.width : 0),
                        y:
                            cropBoxData.top +
                            (action.includes("n") || action.includes("s") ? cropBoxData.height / 2 : 0),
                    };

                    cropperRef.current.zoomTo(updatedZoomRatio, cropboxCenter);

                    // const widthAfterZoom = canvasData.width / resizeRatio;
                    // const heightAfterZoom = canvasData.height / resizeRatio;
                    // const top = containerData.width / 2 + widthAfterZoom / 2;
                    // const left = containerData.height / 2 + heightAfterZoom / 2;

                    // cropperRef.current.moveTo(top, left);

                    cropperRef.current.setCropBoxData({
                        width: cropBoxData.width / resizeRatio,
                        height: cropBoxData.height / resizeRatio,
                        // top: action.includes("s") ? cropBoxData.top - cropBoxData.height / 2 : undefined,
                    });
                });
            }
        },
        [cropData]
    );

    return (
        <>
            {render ? (
                render(open)
            ) : (
                <Button {...props} onClick={open}>
                    Crop
                </Button>
            )}

            <FullscreenModal
                isOpen={isOpen}
                close={close}
                title="Resize image"
                body={
                    <Flex h="100%" direction="column" justify="center">
                        <img ref={makeCropper} src={src} />
                    </Flex>
                }
                footer={
                    <Flex w="100%" justify="space-between">
                        <div>
                            <Button variant="outline" mr={3} onClick={reset}>
                                Reset
                            </Button>
                        </div>
                        <div>
                            <Button variant="outline" mr={3} onClick={close}>
                                Cancel
                            </Button>
                            <Button variantColor="blue" onClick={handleCrop}>
                                Save
                            </Button>
                        </div>
                    </Flex>
                }
            />
        </>
    );
}
