import { useWindowSize } from "@/hooks/dom";
import styled from "@emotion/styled";

import { ImageGridItem, ImageGridItemProps } from "./ImageGridItem";
import { PhotoGridItem } from "./PhotoGrid";

export const ImageGrid = ({ images, selectedImageId, ...rest }: ImageGridProps) => {
    const { height, width } = useWindowSize();
    return (
        <StyledGrid>
            {images.map((img) => {
                return (
                    <ImageGridItem
                        key={img.id}
                        isSelected={selectedImageId === img.id}
                        id={img.id}
                        img={img}
                        height={height}
                        width={width}
                        {...rest}
                    />
                );
            })}
        </StyledGrid>
    );
};

const StyledGrid = styled.div`
    display: grid;
    grid-gap: 0.5rem;
    margin: 0.5rem;
    grid-template-columns: repeat(3, 1fr);
`;

type ImageGridProps = { images: PhotoGridItem[]; selectedImageId: PhotoGridItem["id"] } & Pick<
    ImageGridItemProps,
    "setSelectedImage" | "unsetSelectedImage" | "setSpring" | "setBackgroundSpring" | "zIndexQueue"
>;
