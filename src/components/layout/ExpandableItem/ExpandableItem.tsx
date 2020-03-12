import { Box, useColorMode } from "@chakra-ui/core";
import { CSSProperties, memo, useEffect, useRef, useState } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import { COMMON_COLORS } from "@/config/theme";
import { areArrayEqual, shallowDiffers } from "@/functions/utils";
import { useVelocityTrackedSpring } from "@/hooks/dom/useVelocityTrackedSpring";
import { FlipperOnFlipParams } from "@/services/Flipper";

import { dragSelected, dragUnselected } from "./drag";
import { ExpandableRenderListProps } from "./ExpandableGrid";

export const ExpandableItem = memo(
    function({
        item,
        index,
        renderItem,
        flipId,
        isSelected,
        setSelected,
        unselect,
        storeSpringSet,
        width,
        zIndexQueue,
        setBackgroundSpring,
        memoData,
        style,
        getEl,
        columnWidth,
    }: ExpandableItemProps) {
        const { colorMode } = useColorMode();

        const [isResting, setResting] = useState(true);
        const shouldUpdateRestStatus = useRef(false);

        const [{ y }, setY] = useVelocityTrackedSpring(() => ({ y: 0 }));
        const [{ x }, setX] = useSpring(() => ({ x: 0 }));
        const [{ scaleX, scaleY }, setScale] = useSpring(() => ({
            scaleX: 1,
            scaleY: 1,
            onStart: () => {
                shouldUpdateRestStatus.current && setResting(false);
            },
            onRest: () => {
                shouldUpdateRestStatus.current && setResting(true);
            },
        }));

        const [after, setAfter] = useState<DOMRect>();

        const set = (args: any, flipParams?: FlipperOnFlipParams) => {
            // Allow passing future (measure after spring) DOMRect to renderItem
            flipParams?.after && setAfter(flipParams.after);

            // If flipping (=/= dragging, allow updating isResting state)
            shouldUpdateRestStatus.current = flipParams?.data?.isFlipping;

            if (args.y !== undefined) setY(args);
            if (args.x !== undefined) setX(args);
            if (args.scaleX !== undefined) setScale(args);
        };

        useEffect(() => {
            storeSpringSet(flipId, set);
        }, []);

        const dragCallback = isSelected
            ? dragSelected({
                  onImageDismiss: () => {
                      unselect(item);
                      setValid(false);
                  },
                  onDragReset: () => {
                      setValid(false);
                  },
                  x,
                  y,
                  set,
                  setBackgroundSpring,
                  width,
              })
            : dragUnselected({
                  doSelect: () => {
                      setSelected(item);
                  },
              });

        const [isValid, setValid] = useState(false);
        const bind = useDrag((dragProps) => {
            if (isSelected && !dragProps.memo?.isValid) {
                const isIntentionalGesture = Math.abs(dragProps.movement[1]) > 30;
                setValid(isIntentionalGesture);
                if (!isIntentionalGesture) return;

                if (!dragProps.memo) {
                    dragProps.memo = {};
                }
                dragProps.memo.isValid = true;
            }

            return dragCallback(dragProps);
        });

        return (
            <Box
                as={animated.div}
                data-flip-key={flipId}
                pos="relative"
                display="flex"
                borderWidth={isSelected ? 0 : "2px"}
                borderColor={COMMON_COLORS.bgColor[colorMode]}
                height="100%"
                transformOrigin="0 0"
                css={
                    isSelected
                        ? {
                              position: "fixed",
                              top: 0,
                              left: 0,
                              width: "100vw",
                              height: "100%",
                              justifyContent: "center",
                              touchAction: "none",
                              alignItems: "center",
                          }
                        : { touchAction: "manipulation" }
                }
                {...bind()}
                style={{
                    ...(isSelected ? {} : style),
                    zIndex: interpolate([x, y], (x, y) => {
                        const animationInProgress = x !== 0 || y !== 0;
                        if (isSelected) return 5;
                        if (zIndexQueue.slice(-1)[0] === flipId && animationInProgress) return 5;
                        if (zIndexQueue.indexOf(flipId) > -1 && animationInProgress) return 2;
                        return 1;
                    }),
                    transform: interpolate([x, y, scaleX, scaleY], (x, y, scaleX, scaleY) => {
                        return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
                    }),
                }}
            >
                {renderItem({
                    item,
                    index,
                    flipId,
                    memoData,
                    isSelected,
                    isDragging: isValid,
                    isResting,
                    after,
                    getEl,
                    columnWidth,
                })}
            </Box>
        );
    },
    (prevProps, nextProps) => {
        const areMemoEqual =
            prevProps.memoData || nextProps.memoData
                ? prevProps.memoData && nextProps.memoData && !shallowDiffers(prevProps.memoData, nextProps.memoData)
                : true;
        const areEqual =
            prevProps.flipId === nextProps.flipId &&
            prevProps.isSelected === nextProps.isSelected &&
            prevProps.width === nextProps.width &&
            prevProps.height === nextProps.height &&
            areArrayEqual(prevProps.zIndexQueue, nextProps.zIndexQueue) &&
            areMemoEqual;

        return areEqual;
    }
);

export type ExpandableItemProps<T extends object = object> = {
    index: number;
    item: T;
    flipId: string;
    isSelected: boolean;
    width: number;
    height: number;
    memoData?: any;
    style?: CSSProperties;
    columnWidth?: number;
} & Pick<
    ExpandableRenderListProps<T>,
    | "renderItem"
    | "setSelected"
    | "unselect"
    | "storeSpringSet"
    | "zIndexQueue"
    | "setBackgroundSpring"
    | "after"
    | "getEl"
>;
