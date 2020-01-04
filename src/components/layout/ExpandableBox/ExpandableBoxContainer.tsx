import { Box, BoxProps, useColorMode } from "@chakra-ui/core";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { forwardRef, useCallback, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

import { COMMON_COLORS } from "@/config/theme";
import { useClientEffect } from "@/functions/utils";
import { useWindowSize } from "@/hooks/dom";
import { useCombinedRefs } from "@/hooks/useCombinedRefs";
import { Flipper } from "@/services/Flipper";

import { bounceConfig, defaultSpringSettings } from "../ExpandableGrid/config";
import { ExpandableBox } from "./ExpandableBox";

export const ExpandableBoxContainer = forwardRef<HTMLElement, ExpandableBoxContainerProps>(
    ({ identifier, children, boxProps }, ref) => {
        const [isExpanded, setExpanded] = useState(null);

        const springSetRef = useRef<UseSpringSet>(null);
        const storeSpringSet = useCallback((set: UseSpringSet) => {
            springSetRef.current = set;
        }, []);
        const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({ opacity: 0 }));

        const containerRef = useCombinedRefs(ref);
        const flipRef = useRef(
            new Flipper({
                ref: containerRef,
                onFlip(id, vals, data = {}) {
                    const set = springSetRef.current;
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
            if (isExpanded === null) return;

            if (isExpanded) {
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
        }, [isExpanded]);

        const select = useCallback(() => {
            flipRef.current.beforeFlip(identifier);
            disableBodyScroll(window.document.documentElement);
            setExpanded(true);
        }, [isExpanded]);

        const unselect = useCallback(() => {
            flipRef.current.beforeFlip(identifier);
            enableBodyScroll(window.document.documentElement);
            setExpanded(false);
        }, []);

        const { width, height } = useWindowSize();
        const itemProps = { identifier, isExpanded, unselect, storeSpringSet, setBackgroundSpring, width, height };
        const { colorMode } = useColorMode();

        return (
            <Box pos="relative" {...boxProps} ref={containerRef}>
                selected: {isExpanded ? "oui" : "non"}
                <ExpandableBox setSelected={select} {...itemProps}>
                    {children}
                </ExpandableBox>
                <AnimatedBox
                    pos="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents={!isExpanded ? "none" : "all"}
                    backgroundColor={COMMON_COLORS.bgColor[colorMode]}
                    zIndex={3}
                    willChange="opacity"
                    style={backgroundSpring}
                />
            </Box>
        );
    }
);

export type ExpandableBoxContainerProps = { identifier: string; boxProps?: BoxProps } & ChildrenProp;

const AnimatedBox = animated(Box);
