import { Box, ButtonGroup, Flex } from "@chakra-ui/core";
import {
    ForwardRefExoticComponent, memo, RefAttributes, useCallback, useMemo, useState
} from "react";
import { IoMdImages } from "react-icons/io";

import { ActionBtn } from "@/components/buttons";
import { ModalButton } from "@/components/buttons/ModalBtn";
import { CustomIcon } from "@/components/common/CustomIcon";
import { Picture } from "@/components/common/Picture";
import { ExpandableGrid } from "@/components/layout/ExpandableItem/ExpandableGrid";
import {
    ExpandableList as ExpList, ExpandableListProps
} from "@/components/layout/ExpandableItem/ExpandableList";
import { SwipableProps, SwipeDirection, SwipePosition } from "@/components/layout/Swipable";
import { useWindowSize } from "@/hooks/dom";
import { useLazyScroll } from "@/hooks/dom/useLazyScroll";
import { AutocompleteResultListRenderPropArg } from "@/hooks/form/useAutocomplete";
import { useCallbackRef } from "@/hooks/useCallbackRef";

import { ExpandableMemesAutocomplete, MemeSearchResult } from "./ExpandableMemesAutocomplete";
import { MemeSlider } from "./MemeBox";

export function MemeSearch() {
    const [containerRef, getRef] = useCallbackRef();
    // console.log("meme search render");
    const setSelecteds = useCallback((selecteds) => {
        selecteds.length && console.log(selecteds);
    }, []);

    return (
        <>
            <div ref={getRef}>
                <ExpandableMemesAutocomplete
                    options={{ resultListContainer: containerRef.current }}
                    render={{
                        resultList: (args) => <MemeResultList items={args.items} resultListRef={args.resultListRef} />,
                    }}
                    setSelecteds={setSelecteds}
                />
            </div>
        </>
    );
}

export const MemeResultList = memo(function(
    args: Pick<AutocompleteResultListRenderPropArg<MemeSearchResult>, "resultListRef" | "items">
) {
    const [sliderPos, setSliderPos] = useState<Record<string, SwipePosition>>({});
    const storeSliderPos = (id: string, pos: SwipePosition) => setSliderPos((prevPos) => ({ ...prevPos, [id]: pos }));

    return (
        <ExpandableList
            ref={args.resultListRef}
            items={args.items}
            getId={(item) => item._id}
            renderBox={(props) =>
                props.selected && (
                    <>
                        <Box pos="absolute" top="0" w="100%">
                            top
                            <Flex justifyContent="space-between">
                                <ButtonGroup>
                                    <ActionBtn
                                        variant="ghost"
                                        size="md"
                                        label="Back"
                                        icon={"arrow-back"}
                                        fontSize="2xl"
                                        onClick={() => props.unselect()}
                                    />
                                </ButtonGroup>
                                <ButtonGroup>
                                    <ModalButton>Enregistrer</ModalButton>
                                </ButtonGroup>
                            </Flex>
                        </Box>
                        <Box pos="absolute" bottom="0" w="100%">
                            bot
                        </Box>
                    </>
                )
            }
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
export const MemeResult = memo(
    function({ item, isSelected, isDragging, storeSliderPos, currentPos = { x: 0, y: 0 } }: MemeResultProps) {
        const onSwipe = (direction: SwipeDirection, pos: SwipePosition) => {
            storeSliderPos(item._id, pos);
        };

        const { width } = useWindowSize();
        const [ref, isVisible] = useLazyScroll();

        const isMultipartMeme = useMemo(() => item._source.pictures.length > 1, [item]);

        const component = (
            <>
                <Picture
                    useResponsive={false}
                    item={item._source.pictures[currentPos.x]}
                    w="100%"
                    css={{ visibility: isMultipartMeme && isSelected && !isDragging ? "hidden" : undefined }}
                />
                {isMultipartMeme ? (
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
                ) : null}
                {isMultipartMeme && !isSelected ? (
                    <CustomIcon icon={IoMdImages} color="white" pos="absolute" top="5px" right="5px" size="20px" />
                ) : null}
                <Box pos="absolute" bottom="0">
                    {isDragging ? "oui" : "non"}
                </Box>
            </>
        );

        return (
            <div css={{ display: "flex", width: "100%" }} ref={ref}>
                {isVisible && component}
            </div>
        );
    },
    (prevProps, nextProps) => {
        const areEqual =
            prevProps.item._id === nextProps.item._id &&
            prevProps.isSelected === nextProps.isSelected &&
            prevProps.isDragging === nextProps.isDragging &&
            ((prevProps.currentPos === undefined && nextProps.currentPos === undefined) ||
                (prevProps.currentPos?.x === nextProps.currentPos?.x &&
                    prevProps.currentPos?.y === nextProps.currentPos?.y));
        return areEqual;
    }
);

// Typing forwardRef component with generic args
const ExpandableList = ExpList as ForwardRefExoticComponent<
    ExpandableListProps<MemeSearchResult> & RefAttributes<HTMLElement>
>;
