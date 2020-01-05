import { Box, useColorMode } from "@chakra-ui/core";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { forwardRef, useCallback, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

import { COMMON_COLORS } from "@/config/theme";
import { useClientEffect } from "@/functions/utils";
import { useWindowSize } from "@/hooks/dom";
import { useCombinedRefs } from "@/hooks/useCombinedRefs";
import { Flipper } from "@/services/Flipper";

import { bounceConfig, defaultSpringSettings } from "./config";
import { ExpandableItem } from "./ExpandableItem";
import { ExpandableListProps } from "./ExpandableList";

export const ExpandableBox = forwardRef<HTMLElement, ExpandableBoxProps>(
    ({ identifier, renderItem, boxProps }, ref) => {
        const [isSelected, setSelected] = useState(null);

        const springsRef = useRef<Record<string, UseSpringSet>>({});
        const storeSpringSet = useCallback((id: string, set: UseSpringSet) => {
            springsRef.current[id] = set;
        }, []);
        const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({ opacity: 0 }));

        const containerRef = useCombinedRefs(ref);
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

        useClientEffect(() => {
            if (isSelected === null) return;

            if (isSelected) {
                flipRef.current.flip(identifier);
                requestAnimationFrame(() => {
                    disableBodyScroll(window.document.documentElement);
                });
            } else {
                requestAnimationFrame(() => {
                    enableBodyScroll(window.document.documentElement);
                });
                flipRef.current.flip(identifier, { isLeaving: true });
            }
        }, [isSelected]);

        const select = useCallback(() => {
            flipRef.current.beforeFlip(identifier);
            disableBodyScroll(window.document.documentElement);
            setSelected(true);
        }, [isSelected]);

        const unselect = useCallback(() => {
            flipRef.current.beforeFlip(identifier);
            enableBodyScroll(window.document.documentElement);
            setSelected(false);
        }, []);

        const { width, height } = useWindowSize();
        const itemProps = {
            flipId: identifier,
            isSelected,
            unselect,
            storeSpringSet,
            setBackgroundSpring,
            width,
            height,
            item: {},
            zIndexQueue: [] as any,
        };
        const { colorMode } = useColorMode();

        return (
            <Box pos="relative" {...boxProps} ref={containerRef}>
                selected: {isSelected ? "oui" : "non"}
                <ExpandableItem renderItem={renderItem} setSelected={select} {...itemProps} />
                <AnimatedBox
                    pos="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents={!isSelected ? "none" : "all"}
                    backgroundColor={COMMON_COLORS.bgColor[colorMode]}
                    zIndex={3}
                    willChange="opacity"
                    style={backgroundSpring}
                />
            </Box>
        );
    }
);

export type ExpandableBoxProps = Pick<ExpandableListProps, "renderItem" | "boxProps"> & {
    identifier: string;
};

const AnimatedBox = animated(Box);
