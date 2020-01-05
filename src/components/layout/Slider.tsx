import { Box, BoxProps, Flex, FlexProps, PseudoBox, Stack, StackProps } from "@chakra-ui/core";
import { Children, forwardRef, ReactElement, useCallback, useMemo, useState } from "react";

import { COMMON_COLORS } from "@/config/theme";
import { InterpolationWithTheme } from "@emotion/core";

import { Swipable } from "./";
import { SwipableProps, SwipeDirection, SwipePosition } from "./Swipable";

// TODO Infinite items loop ?

export const Slider = forwardRef<HTMLElement, SliderProps>(
    (
        {
            children,
            width,
            isFullHeight,
            isDisabled,
            onSwipe,
            flexProps,
            stackProps,
            wrapperProps,
            currentPos = { x: 0, y: 0 },
        },
        ref
    ) => {
        const list = useMemo(() => (children ? Children.toArray<ReactElement>(children) : []), [children]);

        const [sliderPos, setSliderPos] = useState(currentPos);
        const handleSwipe = useCallback((direction: SwipeDirection, currentPos: SwipePosition) => {
            setSliderPos(currentPos);
            onSwipe?.(direction, currentPos);
        }, []);
        // const [ref, { width }] = useMeasure();
        // console.log(sliderPos, width);

        return (
            <Flex {...(!isFullHeight && baseCss.flex)} {...flexProps} direction="column" ref={ref}>
                <Box overflow="hidden" width="100%" height="100%">
                    <Swipable
                        pos="relative"
                        height="100%"
                        {...wrapperProps}
                        axis={"X"}
                        xDistance={width}
                        boundaries={{ x: [0, list.length - 1], y: [0, 0] }}
                        onSwipe={handleSwipe}
                        currentPos={sliderPos}
                        isDisabled={isDisabled}
                    >
                        {list.map((child, index) => (
                            <Box key={index} w="100%" h="100%" pos="absolute" transform={`translateX(${index * 100}%)`}>
                                {child}
                            </Box>
                        ))}
                    </Swipable>
                </Box>
                <Stack
                    isInline
                    spacing="10px"
                    justifyContent="center"
                    alignItems="center"
                    paddingY="10px"
                    minH="32px"
                    {...(isFullHeight && fullHeightCss.stack)}
                    {...stackProps}
                >
                    {list.map((child, index) => (
                        <PseudoBox
                            key={index}
                            bg={COMMON_COLORS.hover["dark"]}
                            aria-selected={index === sliderPos.x}
                            _selected={{
                                backgroundColor: COMMON_COLORS.selected["dark"],
                                width: "12px",
                                height: "12px",
                            }}
                            borderRadius="50%"
                            w="8px"
                            h="8px"
                            transition="all 0.3s"
                            onClick={() => setSliderPos({ x: index, y: 0 })}
                        />
                    ))}
                </Stack>
            </Flex>
        );
    }
);

const baseCss: Record<string, InterpolationWithTheme<any>> = {
    flex: { paddingY: "10px", height: "285px" },
};
const fullHeightCss: Record<string, InterpolationWithTheme<any>> = {
    stack: { pos: "absolute", left: 0, right: 0, top: "100%" },
};

export type SliderProps = ChildrenProp<object> & {
    width: number;
    flexProps?: FlexProps;
    stackProps?: StackProps;
    wrapperProps?: BoxProps;
    isFullHeight?: boolean;
    isDisabled?: boolean;
    onSwipe?: SwipableProps["onSwipe"];
    currentPos?: SwipableProps["currentPos"];
};
