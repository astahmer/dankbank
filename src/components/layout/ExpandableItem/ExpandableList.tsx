import { Box, BoxProps, usePrevious } from "@chakra-ui/core";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { forwardRef, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

import { useEnhancedEffect } from "@/functions/utils";
import { useCombinedRefs } from "@/hooks/useCombinedRefs";
import { Flipper } from "@/services/Flipper";

import { ExpandableRenderListProps } from "./ExpandableGrid";
import { ExpandableItemProps } from "./ExpandableItem";

export const ExpandableList = forwardRef<HTMLElement, ExpandableListProps>(
    ({ items, getId, renderBox, renderList, renderItem, onSelected, boxProps, memoData }, ref) => {
        const [selected, setSelected] = useState<any>(null);
        const getFlipId = useCallback((item: object) => "img-" + getId(item), [getId]);
        const isSame = useCallback((a: object, b: object) => a && b && getFlipId(a) === getFlipId(b), [getFlipId]);

        const springsRef = useRef<Record<string, UseSpringSet>>({});
        const storeSpringSet = useCallback((id: string, set: UseSpringSet) => {
            springsRef.current[id] = set;
        }, []);
        const containerRef = useCombinedRefs(ref);
        const zIndexQueue = useRef<string[]>([]);
        const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({ opacity: 0 }));

        const flipRef = useRef(
            new Flipper({
                ref: containerRef,
                onFlip(id, { diff, data = {}, before, after }) {
                    const set = springsRef.current[id] as any;
                    const el = this.getEl(id);

                    data.isFlipping = true;
                    el.style.zIndex = 5;

                    set(
                        {
                            ...diff,
                            immediate: true,
                            onFrame: undefined,
                        } as any,
                        { before, after, data }
                    );

                    requestAnimationFrame(() => {
                        setBackgroundSpring({ opacity: data.isLeaving ? 0 : 1 });

                        const springSettings = {
                            ...defaultSpringSettings,
                            config: data.isLeaving ? bounceConfig : defaultSpringSettings.config,
                        };

                        set({ ...springSettings, immediate: false }, { data });
                    });
                },
            })
        );

        const previous = usePrevious(selected);

        const getEl = useCallback((flipId: string) => flipRef.current.getEl(flipId), []);

        useEnhancedEffect(() => {
            if (previous === undefined || isSame(previous, selected)) return;
            if (selected) {
                flipRef.current.flip(getFlipId(selected));
                requestAnimationFrame(() => {
                    zIndexQueue.current.push(getFlipId(selected));
                    disableBodyScroll(window.document.documentElement);
                });
            } else if (previous) {
                requestAnimationFrame(() => {
                    enableBodyScroll(window.document.documentElement);
                });
                flipRef.current.flip(getFlipId(previous), { isLeaving: true });
            }
        }, [previous, selected]);

        const select = useCallback(
            (item: object) => {
                flipRef.current.beforeFlip(getFlipId(item));
                disableBodyScroll(window.document.documentElement);
                setSelected(item);
            },
            [selected]
        );

        const unselect = useCallback((item: object) => {
            flipRef.current.beforeFlip(getFlipId(item));
            enableBodyScroll(window.document.documentElement);
            setSelected(null);
        }, []);

        useEffect(() => {
            onSelected?.(selected);
        }, [selected]);

        const listProps: ExpandableRenderListProps = {
            items,
            getFlipId,
            renderItem,
            selected,
            setSelected: select,
            unselect,
            storeSpringSet,
            setBackgroundSpring,
            zIndexQueue: zIndexQueue.current,
            memoData,
            getEl,
        };

        return (
            <Box pos="relative" {...boxProps} ref={containerRef}>
                {renderList(listProps)}
                <AnimatedBox
                    pos="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents={!selected ? "none" : "all"}
                    backgroundColor={"gray.900"}
                    zIndex={4}
                    willChange="opacity"
                    style={backgroundSpring}
                ></AnimatedBox>
                <Box pos="fixed" top="0" left="0" right="0" zIndex={5} style={backgroundSpring}>
                    {renderBox?.({ selected, unselect: () => unselect(selected) })}
                </Box>
            </Box>
        );
    }
);

export type ExpandableListProps<T extends object = object> = {
    items: T[];
    getId: (item: T) => string | number;
    renderBox?: ({ selected }: ExpandableListRenderBoxArgs<T>) => ReactElement;
    renderList: (props: ExpandableRenderListProps<T>) => ReactElement;
    renderItem: (args: ExpandableListRenderItemArgs<T>) => ReactElement;
    onSelected?: (item: T) => void;
    boxProps?: BoxProps;
    memoData?: Record<string | number, any>;
};

export type ExpandableListRenderBoxArgs<T extends object = object> = Pick<ExpandableRenderListProps<T>, "selected"> & {
    unselect: () => void;
};
export type ExpandableListRenderItemArgs<T extends object = object, M = any> = Pick<
    ExpandableItemProps<T>,
    "item" | "index" | "flipId" | "memoData" | "isSelected" | "after" | "getEl" | "columnWidth"
> & {
    memoData: M;
    isDragging: boolean;
    isResting: boolean;
};

const AnimatedBox = animated(Box);

const defaultSpringSettings = {
    y: 0,
    x: 0,
    scaleX: 1,
    scaleY: 1,
    config: { tension: 500, friction: 50 },
};
const bounceConfig = { tension: 500, friction: 30 };
