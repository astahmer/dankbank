import { Box, ImageProps } from "@chakra-ui/core";
import { forwardRef } from "react";

// Awaiting Chakra's Fix on image component https://github.com/chakra-ui/chakra-ui/issues/225
const NativeImage = forwardRef(({ htmlWidth, htmlHeight, alt, ...props }: any, ref) => (
    <img width={htmlWidth} height={htmlHeight} alt={alt} {...props} ref={ref} />
));

export type CustomImageProps = ImageProps & { srcSet?: string; sizes?: string };

export const CustomImage = forwardRef(({ src, fallbackSrc, onError, onLoad, ...props }: CustomImageProps, ref) => {
    const imageProps = { src, onLoad, onError };
    return <Box as={NativeImage} ref={ref} {...imageProps} {...props} />;
});
