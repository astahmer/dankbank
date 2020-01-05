import { Box, useColorMode } from "@chakra-ui/core";
import { memo, useEffect, useState } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import { useVelocityTrackedSpring } from "@/hooks/dom/useVelocityTrackedSpring";

import { getSelectedCss } from "./config";
import { dragSelected, dragUnselected } from "./drag";
import { ExpandableGridProps } from "./ExpandableGrid";

export const ExpandableItem = memo(function({
    item,
    renderItem,
    flipId,
    isSelected,
    setSelected,
    unselect,
    storeSpringSet,
    width,
    height,
    zIndexQueue,
    setBackgroundSpring,
}: ExpandableGridItem) {
    const { colorMode } = useColorMode();

    const [{ y }, setY] = useVelocityTrackedSpring(() => ({ y: 0 }));
    const [{ x }, setX] = useSpring(() => ({ x: 0 }));
    const [{ scaleX, scaleY }, setScale] = useSpring(() => ({ scaleX: 1, scaleY: 1 }));

    const set = (args: any) => {
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
        <Box pos="relative">
            <Box
                as={animated.div}
                data-flip-key={flipId}
                pos="relative"
                display="flex"
                bg={colorMode === "light" ? "gray.100" : "blue.900"}
                height="100%"
                transformOrigin="0 0"
                css={isSelected ? getSelectedCss(height) : { touchAction: "manipulation" }}
                {...bind()}
                style={{
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
                {renderItem({ item, isSelected, isDragging: isValid })}
            </Box>
        </Box>
    );
});

type ExpandableGridItem<T extends object = object> = {
    item: T;
    flipId: string;
    isSelected: boolean;
    width: number;
    height: number;
} & Pick<
    ExpandableGridProps<T>,
    "renderItem" | "setSelected" | "unselect" | "storeSpringSet" | "zIndexQueue" | "setBackgroundSpring"
>;
