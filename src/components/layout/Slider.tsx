import { Box, BoxProps, Flex, FlexProps, PseudoBox, Stack, StackProps } from "@chakra-ui/core";
import { Children, ReactElement, useCallback, useMemo, useState } from "react";

import { COMMON_COLORS } from "@/config/theme";
import { useDimensions } from "@/hooks/dom";

import { Swipable } from "./";

// TODO Infinite items loop ?

export function Slider({ children, flexProps, stackProps, wrapperProps }: SliderProps) {
    const list = useMemo(() => (children ? Children.toArray<ReactElement>(children) : []), [children]);

    const [{ x: activeSlide }, setSliderPos] = useState({ x: 0, y: 0 });
    const onSwipe = useCallback((direction, currentPos) => setSliderPos(currentPos), []);
    const [ref, { width }] = useDimensions();

    return (
        <Flex paddingY="10px" h="285px" {...flexProps} direction="column" overflow="hidden">
            <Swipable
                pos="relative"
                height="100%"
                {...wrapperProps}
                axis={"X"}
                xDistance={width}
                boundaries={{ x: [0, list.length - 1], y: [0, 0] }}
                onSwipe={onSwipe}
                ref={ref}
            >
                {list.map((child, index) => (
                    <Box key={index} w="100%" h="100%" pos="absolute" transform={`translateX(${index * 100}%)`}>
                        {child}
                    </Box>
                ))}
            </Swipable>
            <Stack isInline spacing="10px" justifyContent="center" paddingY="10px" {...stackProps}>
                {list.map((child, index) => (
                    <Box key={index}>
                        <PseudoBox
                            bg={COMMON_COLORS.hover["dark"]}
                            aria-selected={index === activeSlide}
                            _selected={{ backgroundColor: COMMON_COLORS.selected["dark"] }}
                            borderRadius="50%"
                            w="8px"
                            h="8px"
                        />
                    </Box>
                ))}
            </Stack>
        </Flex>
    );
}

export type SliderProps = ChildrenProp<object> & {
    flexProps?: FlexProps;
    stackProps?: StackProps;
    wrapperProps?: BoxProps;
};
