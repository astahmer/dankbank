import { Box, BoxProps } from "@chakra-ui/core";
import { Children, MouseEvent, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { animated, interpolate, useSprings } from "react-spring";
import { useDrag } from "react-use-gesture";

import { move } from "@/functions/utils";
import { useLongPress } from "@/hooks/dom/useLongPress";
import { useMutationObserver } from "@/hooks/dom/useMutationObserver";

// Original: https://github.com/chenglou/react-motion/tree/master/demos/demo8-draggable-list

export type DraggableListProps = BoxProps &
    Optional<ChildrenProp<object>> & {
        getId: (props: any) => string | number;
        onOrderChange: (order: number[]) => void;
        dragDelay?: number;
    };

export function DraggableList({ children, getId, onOrderChange, dragDelay = 180, ...props }: DraggableListProps) {
    const list = useMemo(() => (children ? Children.toArray<ReactElement>(children) : []), [children]);
    const containerRef = useRef<HTMLElement>(null);
    const [totalHeight, setTotalHeight] = useState(0);

    const items = useRef<DraggableItem[]>([]);
    const [springs, setSprings] = useSprings(list.length, makeSprings([], []));

    const entries = useMutationObserver(containerRef, { childList: true, subtree: true });
    useEffect(() => {
        if (!entries || !entries.length) {
            return;
        }

        const previewLoaded = entries.find(byImgMutation);
        const listChanges = entries.filter((entry) => containerRef.current.isSameNode(entry.target));

        if (!previewLoaded && !listChanges.length) {
            return;
        }

        if (listChanges.length) {
            for (let i = 0; i < listChanges.length; i++) {
                const mutation = listChanges[i];
                if (mutation.addedNodes.length) {
                    items.current.push({
                        originalIndex: items.current.length,
                        element: (mutation.addedNodes[0] as any) as HTMLElement,
                        identifier: getId(list[items.current.length].props),
                    });
                }
                if (mutation.removedNodes.length) {
                    const filesId = list.map((item) => getId(item.props));
                    const removedItem = items.current.find((item) => !filesId.includes(item.identifier));
                    const removedIndex = items.current.findIndex(
                        (item) => item.originalIndex === removedItem.originalIndex
                    );
                    items.current.splice(removedIndex, 1);

                    for (let i = 0; i < items.current.length; i++) {
                        if (items.current[i].originalIndex > removedItem.originalIndex) {
                            const originalIndex = items.current[i].originalIndex - 1;
                            items.current[i] = {
                                originalIndex,
                                // element: items.current[originalIndex].element,
                                element: containerRef.current.children[originalIndex] as any,
                                identifier: items.current[i].identifier,
                            };
                        }
                    }
                }
            }
        }

        const heights = getHeights(items.current);
        setTotalHeight(getSum(heights));
        setSprings(makeSprings(heights, getIndexes(items.current), { immediate: true }) as any);
    }, [entries]);

    // TODO: Find a way to allow page scrolling even on draggable items
    const canReorder = useRef(false);
    const bindLongPress = useLongPress((event: MouseEvent) => {
        const originalIndex = Array.from(containerRef.current.children).findIndex((item) =>
            item.contains(event.target as Node)
        );
        const orderedIndexes = getIndexes(items.current);
        const draggedIndex = orderedIndexes.indexOf(originalIndex);
        const updated = makeSprings(getHeights(items.current), orderedIndexes, {
            down: true,
            originalIndex,
            draggedIndex,
            y: 0,
        });
        setSprings(updated as any);
        canReorder.current = true;
    }, dragDelay);

    const bind = useDrag(
        ({ args: [originalIndex], down, movement: [x, y] }) => {
            if (!canReorder.current) {
                return;
            }

            const orderedIndexes = getIndexes(items.current);
            const draggedIndex = orderedIndexes.indexOf(originalIndex);
            const currentRow = getCurrentRow(getHeights(items.current), draggedIndex, y);
            const newItemsOrder = move(items.current, draggedIndex, currentRow);
            const newOrder = getIndexes(newItemsOrder);

            const updated = makeSprings(getHeights(newItemsOrder), newOrder, { down, originalIndex, draggedIndex, y });
            setSprings(updated as any);
            if (!down) {
                canReorder.current = false;
                items.current = newItemsOrder;
                onOrderChange && onOrderChange(newOrder);
            }
        },
        { dragDelay: false }
    );

    return (
        <Box
            {...props}
            ref={containerRef}
            position="relative"
            height={totalHeight}
            overflow="hidden"
            maxH={totalHeight}
            {...bindLongPress}
            style={{ userSelect: "none" }}
        >
            {springs.map(({ y, scale, shadow, zIndex }, i) => (
                <AnimatedBox
                    {...bind(i)}
                    key={i}
                    position="absolute"
                    userSelect="none"
                    style={{
                        zIndex,
                        transform: interpolate([y, scale], (y, scale) => `translate3d(0,${y}px,0) scale(${scale})`),
                        boxShadow: interpolate([zIndex, shadow], (zIndex, s) =>
                            zIndex ? `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px` : "none"
                        ),
                        touchAction: "none",
                    }}
                    children={list[i]}
                />
            ))}
        </Box>
    );
}

const AnimatedBox = animated(Box);

const getSum = (values: number[], until?: number) => values.slice(0, until).reduce((acc, val) => acc + val, 0);
const getHeights = (items: DraggableItem[]) => items.map((item) => item.element.clientHeight);
const getIndexes = (items: DraggableItem[]) => items.map((item) => item.originalIndex);
const byImgMutation = (entry: MutationRecord) => Array.from(entry.addedNodes).find((node) => node.nodeName === "IMG");

type DraggableItem = { element: HTMLElement; originalIndex: number; identifier: string | number };

type MakeSpringsParams = {
    down?: boolean;
    originalIndex?: number;
    draggedIndex?: number;
    y?: number;
    immediate?: boolean;
};
const makeSprings = (heights: number[], ordered?: number[], params: MakeSpringsParams = {}) => (index: number) =>
    params.down && index === params.originalIndex
        ? {
              y: getSum(heights, params.draggedIndex) + params.y,
              scale: 1.1,
              zIndex: 1,
              shadow: 15,
              immediate: (n: any) => n === "y" || n === "zIndex",
          }
        : {
              y: getSum(heights, ordered ? ordered.indexOf(index) : index),
              scale: 1,
              zIndex: 0,
              shadow: 1,
              immediate: (n: any) => params.immediate,
          };

const getCurrentRow = (heights: number[], draggedIndex: number, y: number) => {
    const heightSums = heights.map((_, i) => getSum(heights, i + 1));
    const currentHeightSum = getSum(heights, draggedIndex) + heights[draggedIndex] / 2 + y;

    // If currentHeightSum is below 0, currentRow is 0
    // If currentHeightSum is greater than the max cumulative heights of all list elements, then it's the last row
    let currentRow =
        currentHeightSum <= 0
            ? 0
            : currentHeightSum >= heightSums[heightSums.length - 1]
            ? heightSums.length - 1
            : undefined;

    if (currentRow !== undefined) {
        return currentRow;
    }

    // Find the current row by finding in which interval (between which indexes) it fits
    for (let i = 0; i < heightSums.length; i++) {
        if ((!heightSums[i - 1] || currentHeightSum >= heightSums[i - 1]) && currentHeightSum <= heightSums[i]) {
            return i;
        }
    }
};
