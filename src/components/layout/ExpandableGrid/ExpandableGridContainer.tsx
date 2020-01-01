import { Box, usePrevious } from "@chakra-ui/core";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { forwardRef, ReactElement, useCallback, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

import { useEnhancedEffect } from "@/functions/utils";
import { useCombinedRefs } from "@/hooks/useCombinedRefs";
import { Flipper } from "@/services/Flipper";

import { bounceConfig, defaultSpringSettings } from "./config";
import { ExpandableGrid } from "./ExpandableGrid";

export const ExpandableGridContainer = forwardRef<HTMLElement, ExpandableGridContainerProps>(
    ({ items, getId, render }, ref) => {
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
                onFlip(id, vals, data = {}) {
                    const set = springsRef.current[id];
                    const el = this.getEl(id);
                    el.style.zIndex = 5;
                    set({
                        ...vals,
                        immediate: true,
                        onFrame: undefined,
                    } as any);

                    requestAnimationFrame(() => {
                        setBackgroundSpring({ opacity: data.isLeaving ? 0 : 1 });

                        const springSettings = {
                            ...defaultSpringSettings,
                            config: data.isLeaving ? bounceConfig : defaultSpringSettings.config,
                        };

                        set({ ...springSettings, immediate: false });
                    });
                },
            })
        );

        const previous = usePrevious(selected);

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
                console.log(item);
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

        const gridProps = { items, getFlipId, render, selected, unselect, storeSpringSet, setBackgroundSpring };

        return (
            <Box ref={containerRef} pos="relative">
                selected: {selected?._id}
                <ExpandableGrid setSelected={select} zIndexQueue={zIndexQueue.current} {...gridProps} />
                <AnimatedBox
                    pos="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents={!selected ? "none" : "all"}
                    backgroundColor="white"
                    zIndex={3}
                    willChange="opacity"
                    style={backgroundSpring}
                />
            </Box>
        );
    }
);

export type ExpandableGridContainerProps<T extends object = object> = {
    items: T[];
    getId: (item: T) => string | number;
    render: (item: T) => ReactElement;
};

const AnimatedBox = animated(Box);
