import { Box, Flex, Grid } from "@chakra-ui/core";

import { CustomImage } from "@/components/common/CustomImage";
import { Slider } from "@/components/layout/Slider";
import { chunk } from "@/functions/utils";
import { IMeme } from "@/types/entities/Meme";

export function MemeBox({ meme, layout }: MemeBoxProps) {
    return <>{layout === "grid" ? <MemeGrid meme={meme} /> : <MemeSlider meme={meme} />}</>;
}

export type MemeBoxProps = { meme: IMeme; layout: "grid" | "slider" };

export function MemeSlider({ meme }: MemeGridProps) {
    return (
        <Slider>
            {meme.pictures.map((picture) => (
                <CustomImage key={picture.id} src={picture.url} objectFit="contain" w="100%" h="100%" />
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

export type MemeGridProps = { meme: IMeme };

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
