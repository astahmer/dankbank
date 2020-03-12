import { Box, Flex, Grid } from "@chakra-ui/core";
import { MutableRefObject } from "react";

import { CustomImage } from "@/components/common/CustomImage";
import { Picture } from "@/components/common/Picture";
import { Slider, SliderProps } from "@/components/layout/Slider";
import { chunk } from "@/functions/utils";
import { Meme } from "@/types/entities/Meme";

export function MemePictures({ meme, layout }: MemePicturesProps) {
    return <>{layout === "grid" ? <MemeGrid meme={meme} /> : <MemeSlider width={200} meme={meme} />}</>;
}

export type MemePicturesProps = { meme: Meme; layout: "grid" | "slider" };

export type MemeSliderProps = Omit<SliderProps, "children"> & { meme: Meme; innerRef?: MutableRefObject<HTMLElement> };
export function MemeSlider({ meme, innerRef, ...props }: MemeSliderProps) {
    return (
        <Slider {...props} ref={innerRef}>
            {meme.pictures.map((picture) => (
                <Picture item={picture} key={picture.id} useResponsive={false} w="100%" h="100%" />
            ))}
        </Slider>
    );
}

export function MemeGrid({ meme }: MemeGridProps) {
    return (
        <Grid maxH="285px" templateColumns={getColumns(meme.pictures.length)}>
            {meme.pictures.map((picture, index) => (
                <Box
                    key={picture.id}
                    display="flex"
                    height="100%"
                    gridRow={meme.pictures.length === 3 && index === 0 && "span 2"}
                >
                    <CustomImage src={picture.url} objectFit="cover" />
                </Box>
            ))}
        </Grid>
    );
}

export type MemeGridProps = { meme: Meme };

const getColumns = (picturesCount: number) => (picturesCount < 3 ? "1fr" : "1fr 1fr");
export function MemeGrid2({ meme }: MemeGridProps) {
    const chunkedPictures = chunk(meme.pictures, 2);
    return (
        <Flex maxH="285px">
            {chunkedPictures.map((chunk, chunkIndex) => (
                <Flex direction="column" key={chunkIndex}>
                    {chunk.map((picture, index) => (
                        <CustomImage flex="1" key={picture.id} src={picture.url} />
                    ))}
                </Flex>
            ))}
        </Flex>
    );
}
