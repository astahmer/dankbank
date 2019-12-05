type MaxDimensions = { maxWidth?: number; maxHeight?: number };
type Config = MaxDimensions & { forceProportion: boolean; useImgDimensions?: boolean };

/** Create a resised canvas from an image, a max width and a max height.  */
function createResizedCanvas({
    img,
    maxWidth,
    maxHeight,
    forceProportion,
    useImgDimensions,
}: Config & {
    img: HTMLImageElement;
}) {
    // Create canvas
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

    // Utility function to reduce canvas with a ratio
    const reduceCanvas = function(canvas: HTMLCanvasElement, ratio: number) {
        canvas.width = canvas.width / ratio;
        canvas.height = canvas.height / ratio;
    };

    // Utility function to transfert data from a canvas to another
    const copyCanvas = function(source: HTMLCanvasElement, target: HTMLCanvasElement) {
        var targetContext = target.getContext("2d");
        targetContext.clearRect(0, 0, target.width, target.height);
        targetContext.drawImage(source, 0, 0, source.width, source.height, 0, 0, target.width, target.height);
    };

    const getRatio = (maxWidth: number, maxHeight: number, canvas: HTMLCanvasElement) => {
        if (maxWidth && maxHeight) {
            return canvas.width > canvas.height ? canvas.width / maxWidth : canvas.height / maxHeight;
        } else if (maxWidth) {
            return canvas.width / maxWidth;
        } else if (maxHeight) {
            return canvas.height / maxHeight;
        }
    };

    // Utility function to perform a progessive downscale (recursive calling)
    const downscaleCanvas = function(
        canvas: HTMLCanvasElement,
        maxWidth?: number,
        maxHeight?: number,
        tempCanvas?: HTMLCanvasElement
    ) {
        const ratio = getRatio(maxWidth, maxHeight, canvas);
        if (!tempCanvas) {
            tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
        }
        if (ratio > 2) {
            reduceCanvas(tempCanvas, 2);
            copyCanvas(canvas, tempCanvas);
            reduceCanvas(canvas, 2);
            copyCanvas(tempCanvas, canvas);
            downscaleCanvas(canvas, maxWidth, maxHeight, tempCanvas);
        } else if (ratio > 1) {
            reduceCanvas(tempCanvas, ratio);
            copyCanvas(canvas, tempCanvas);
            reduceCanvas(canvas, ratio);
            copyCanvas(tempCanvas, canvas);
        }
    };

    maxWidth = maxWidth || (useImgDimensions && img.width);
    maxHeight = maxHeight || (useImgDimensions && img.height);

    downscaleCanvas(canvas, maxWidth, maxHeight);

    if (forceProportion && (canvas.width < maxWidth || canvas.height < maxHeight)) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = maxWidth;
        tempCanvas.height = maxHeight;
        const tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(
            canvas,
            0,
            0,
            canvas.width,
            canvas.height,
            (maxWidth - canvas.width) / 2,
            (maxHeight - canvas.height) / 2,
            canvas.width,
            canvas.height
        );
        canvas = tempCanvas;
    }

    return canvas;
}

export function getResizedImgDataUrl({
    result,
    maxWidth,
    maxHeight,
    forceProportion,
    useImgDimensions,
}: Config & {
    result: FileReader["result"];
}): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const resizedDataUrl = createResizedCanvas({
                img,
                maxWidth,
                maxHeight,
                forceProportion,
                useImgDimensions,
            }).toDataURL();
            resolve(resizedDataUrl);
        };

        // Start loading
        img.src = result as string;
    });
}

/**
 * Img resizer allows to resize a file image to a max width and height.
 * Creates a data url encoded file.
 */
export function resizeImg({
    file,
    maxWidth,
    maxHeight,
    forceProportion,
    useImgDimensions,
}: Config & {
    file: File;
}): Promise<[FileReader, string]> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = await getResizedImgDataUrl({
                result: reader.result,
                maxWidth,
                maxHeight,
                forceProportion,
                useImgDimensions,
            });
            resolve([reader, dataUrl]);
        };

        // Start loading
        reader.readAsDataURL(file);
    });
}

/** Resize a remote file on client side. */
export function resizeImgFromUrl({
    url,
    maxWidth,
    maxHeight,
    forceProportion,
    useImgDimensions,
    onResizeReady,
}: Config & {
    url: string;
    onResizeReady: (dataUrl: string) => void;
}) {
    const img = new Image();
    img.onload = () => {
        if (onResizeReady) {
            var resized = createResizedCanvas({
                img,
                maxWidth,
                maxHeight,
                forceProportion,
                useImgDimensions,
            }).toDataURL();
            onResizeReady(resized);
        }
    };
    img.src = url;
}
