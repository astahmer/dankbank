import { Box } from "@chakra-ui/core";
import { ForwardRefExoticComponent, memo, RefAttributes, useEffect, useState } from "react";
import { IoMdImages } from "react-icons/io";

import { CustomIcon } from "@/components/common/CustomIcon";
import { Picture } from "@/components/common/Picture";
import { ExpandableGrid } from "@/components/layout/ExpandableItem/ExpandableGrid";
import {
    ExpandableList as ExpList, ExpandableListProps
} from "@/components/layout/ExpandableItem/ExpandableList";
import { SwipableProps, SwipeDirection, SwipePosition } from "@/components/layout/Swipable";
import { useWindowSize } from "@/hooks/dom";
import { AutocompleteResultListRenderPropArg } from "@/hooks/form/useAutocomplete";
import { useCallbackRef } from "@/hooks/useCallbackRef";

import { ExpandableMemesAutocomplete, MemeSearchResult } from "./ExpandableMemesAutocomplete";
import { MemeSlider } from "./MemeBox";

export function MemeSearch() {
    const [containerRef, getRef] = useCallbackRef();
    // console.log("meme search render");

    return (
        <>
            <div ref={getRef}></div>
            <ExpandableMemesAutocomplete
                options={{ resultListContainer: containerRef.current }}
                render={{
                    resultList: (args) => <MemeResultList items={args.items} resultListRef={args.resultListRef} />,
                }}
                setSelecteds={() => {}}
            />
        </>
    );
}

export const MemeResultList = memo(function(
    args: Pick<AutocompleteResultListRenderPropArg<MemeSearchResult>, "resultListRef" | "items">
) {
    const [sliderPos, setSliderPos] = useState<Record<string, SwipePosition>>({});
    const storeSliderPos = (id: string, pos: SwipePosition) => setSliderPos((prevPos) => ({ ...prevPos, [id]: pos }));
    // console.log(args, JSON.stringify(args));
    // console.log(sliderPos);

    return (
        <ExpandableList
            ref={args.resultListRef}
            items={args.items}
            getId={(item) => item._id}
            renderList={(props) => <ExpandableGrid {...props} />}
            renderItem={(itemProps) => (
                <MemeResult {...itemProps} storeSliderPos={storeSliderPos} currentPos={sliderPos[itemProps.item._id]} />
            )}
        />
    );
});

type MemeResultProps = {
    item: MemeSearchResult;
    isSelected: boolean;
    isDragging: boolean;
    storeSliderPos: (id: string, pos: SwipePosition) => void;
    currentPos?: SwipableProps["currentPos"];
};
export function MemeResult({
    item,
    isSelected,
    isDragging,
    storeSliderPos,
    currentPos = { x: 0, y: 0 },
}: MemeResultProps) {
    useEffect(() => {
        storeSliderPos(item._id, currentPos);
    }, []);

    const onSwipe = (direction: SwipeDirection, pos: SwipePosition) => {
        storeSliderPos(item._id, pos);
    };

    const { width } = useWindowSize();

    return (
        <>
            <Picture
                useResponsive={false}
                item={item._source.pictures[currentPos.x]}
                w="100%"
                css={{ visibility: isSelected && !isDragging ? "hidden" : undefined }}
            />
            <MemeSlider
                meme={item._source}
                flexProps={{
                    pos: "absolute",
                    left: 0,
                    top: 0,
                    w: "100%",
                    h: "100%",
                    display: !(isSelected && !isDragging) ? "none" : undefined,
                }}
                width={width}
                isFullHeight
                onSwipe={onSwipe}
                currentPos={currentPos}
                isDisabled={isDragging}
            />
            {item._source.pictures.length > 1 && !isSelected ? (
                <CustomIcon icon={IoMdImages} color="white" pos="absolute" top="5px" right="5px" size="20px" />
            ) : null}
            <Box pos="absolute" bottom="0">
                {isDragging ? "oui" : "non"}
            </Box>
        </>
    );
}

// Typing forwardRef component with generic args
const ExpandableList = ExpList as ForwardRefExoticComponent<
    ExpandableListProps<MemeSearchResult> & RefAttributes<HTMLElement>
>;
