import { ImageProps } from "@chakra-ui/core";
import { forwardRef } from "react";

import { IImage, Quality } from "@/types/entities/Image";

import { CustomImage } from "./CustomImage";

type PictureProps = ImageProps & { item: IImage; useResponsive?: boolean; quality?: Quality };
// TODO alt="picture.tags" ?

export const Picture = forwardRef(
    ({ item, useResponsive = true, quality = Quality.MEDIUM, ...props }: PictureProps, ref) => {
        const responsiveProps = useResponsive
            ? { srcSet: getSrcSetForPicture(item), sizes: getSizesForPicture(item) }
            : {};
        return (
            <CustomImage
                objectFit="cover"
                src={getQualityUrlOrFallback(item, useResponsive ? quality : Quality.ORIGINAL)}
                {...responsiveProps}
                {...props}
                ref={ref}
            />
        );
    }
);

const getSrcSetForPicture = (picture: IImage) =>
    picture.qualities.reduce(
        (srcset, quality) =>
            (srcset +=
                quality !== Quality.ORIGINAL
                    ? getQualityUrl(picture, quality) + " " + getQualitySize(quality as SubQuality) + "w,"
                    : ""),
        ""
    );

const getSizesForPicture = (picture: IImage) =>
    picture.qualities.reduce(
        (sizes, quality) =>
            (sizes +=
                quality !== Quality.ORIGINAL
                    ? `(max-width: ${getQualitySize(quality as SubQuality)}px) ${getQualitySize(
                          quality as SubQuality
                      )}px,`
                    : ""),
        ""
    );

const getImageNameSuffixForQuality = (quality: Quality) =>
    `${quality !== Quality.ORIGINAL ? "_" + quality.toLowerCase() : ""}.jpg`;

const getQualityUrl = (picture: IImage, quality: Quality) =>
    picture.url.replace(".jpg", getImageNameSuffixForQuality(quality));

export const getQualityUrlOrFallback = (picture: IImage, quality: Quality) =>
    getQualityUrl(picture, picture.qualities.includes(quality) ? quality : Quality.ORIGINAL);

const getQualitySize = (quality: SubQuality) => QualitySizes[quality];

type SubQuality = Exclude<Quality, Quality.ORIGINAL>;
const QualitySizes: Record<SubQuality, number> = {
    [Quality.HIGH]: 1500,
    [Quality.MEDIUM]: 750,
    [Quality.LOW]: 375,
};
