import { Box, usePrevious } from "@chakra-ui/core";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { useCallback, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

import { useEnhancedEffect } from "@/functions/utils";

import Flipper from "./Flipper";
import { ImageGrid } from "./ImageGrid";

export function PhotoGrid({ items = [] }: { items: PhotoGridItem[] }) {
    const containerRef = useRef(null);
    const zIndexQueue = useRef([]);

    const [selectedImageId, setSelectedImage] = useState(null);
    const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({ opacity: 0 }));

    const springsRef = useRef<Record<string, { springVals: any; set: any }>>({});
    const setSpring = useCallback(({ id, springVals, set }) => {
        springsRef.current[id] = { springVals, set };
    }, []);

    const flipRef = useRef(
        new Flipper({
            ref: containerRef,
            onFlip(id, vals, data = {}) {
                const set = springsRef.current[id].set;
                const el = this.getEl(id);
                el.style.zIndex = 5;
                set({
                    ...vals,
                    immediate: true,
                    onFrame: () => {},
                });

                requestAnimationFrame(() => {
                    setBackgroundSpring({ opacity: data.isLeaving ? 0 : 1 });

                    const springSettings = {
                        ...defaultSpringSettings,
                        config: data.isLeaving ? bounceConfig : defaultSpringSettings.config,
                    };

                    set(
                        {
                            ...springSettings,
                            immediate: false,
                        },
                        { skipSetVelocity: true }
                    );
                });
            },
        })
    );

    const previousSelectedImageId = usePrevious(selectedImageId);

    useEnhancedEffect(() => {
        if (previousSelectedImageId === undefined || previousSelectedImageId === selectedImageId) return;
        if (selectedImageId) {
            flipRef.current.flip(selectedImageId);
            requestAnimationFrame(() => {
                zIndexQueue.current.push(selectedImageId);
                disableBodyScroll(containerRef.current);
            });
        } else {
            requestAnimationFrame(() => {
                enableBodyScroll(containerRef.current);
            });
            flipRef.current.flip(previousSelectedImageId, { isLeaving: true });
        }
    }, [previousSelectedImageId, selectedImageId]);

    const wrappedSetSelectedImage = useCallback((id) => {
        flipRef.current.beforeFlip(id);
        disableBodyScroll(window.document.documentElement);
        setSelectedImage(id);
    }, []);

    const wrappedUnsetSelectedImage = useCallback((id) => {
        flipRef.current.beforeFlip(id);
        enableBodyScroll(window.document.documentElement);
        setSelectedImage(null);
    }, []);

    return (
        <Box ref={containerRef} pos="relative">
            <ImageGrid
                zIndexQueue={zIndexQueue.current}
                setSpring={setSpring}
                selectedImageId={selectedImageId}
                setSelectedImage={wrappedSetSelectedImage}
                unsetSelectedImage={wrappedUnsetSelectedImage}
                setBackgroundSpring={setBackgroundSpring}
                images={items}
            />

            <AnimatedBox
                pos="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                pointerEvents={!selectedImageId ? "none" : "all"}
                backgroundColor="white"
                zIndex={3}
                willChange="opacity"
                style={backgroundSpring}
            />
        </Box>
    );
}

export type PhotoGridItem = { id: string; url: string };

const AnimatedBox = animated(Box);

const defaultSpringSettings = {
    y: 0,
    x: 0,
    scaleX: 1,
    scaleY: 1,
    config: {
        tension: 500,
        friction: 50,
    },
};

const bounceConfig = {
    tension: 500,
    friction: 30,
};
