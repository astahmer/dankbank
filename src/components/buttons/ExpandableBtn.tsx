import { Box, BoxProps, InputProps, PseudoBox, useColorMode } from "@chakra-ui/core";
import { forwardRef, MutableRefObject, useEffect, useRef } from "react";
import { animated, config, useSpring } from "react-spring";

import { COMMON_COLORS } from "@/config/theme";
import { vwToPixel } from "@/functions/utils";
import { useClickOutside } from "@/hooks/dom";
import { useToggle } from "@/hooks/useToggle";

import { ActionBtn } from "./ActionBtn";
import { FloatingBtnProps } from "./FloatingBtn";

export type ExpandableBtnProps = {
    direction?: ExpandDirection;
    wrapperPosition?: BoxProps["position"];
    btnProps?: FloatingBtnProps;
    inputProps?: InputProps;
};

export const ExpandableBtn = forwardRef<HTMLInputElement, ExpandableBtnProps>(
    ({ direction = "left", wrapperPosition = "absolute", btnProps, inputProps }, ref) => {
        const { colorMode } = useColorMode();

        const [isExpanded, { toggle, close }] = useToggle();
        const spring = useSpring({
            config: { tension: 320, friction: 32 },
            width: isExpanded ? `${vwToPixel(100) - 40}px` : "0px",
            opacity: isExpanded ? 1 : 0,
            borderRadius: "50px",
        });

        // Focus input on opening
        useEffect(() => {
            if (isExpanded) {
                (ref as MutableRefObject<HTMLInputElement>)?.current?.focus();
            }
        }, [isExpanded]);

        const selfRef = useRef<HTMLElement>();
        useClickOutside(selfRef, close);

        return (
            <Box position={wrapperPosition} w="48px" ref={selfRef}>
                <Box position="absolute" top="0" {...getInputBoxStyle(direction)}>
                    <AnimatedInput
                        h="48px"
                        bg={"gray.300"}
                        color={COMMON_COLORS.color["light"]}
                        _placeholder={{ color: "gray.500", fontSize: "0.9em" }}
                        pl="56px"
                        pr="15px"
                        minWidth="56px"
                        {...inputProps}
                        as="input"
                        ref={ref}
                        style={spring}
                    />
                    <AnimatedActionBtn
                        size="lg"
                        bg={colorMode === "dark" ? "blue.500" : "blue.300"}
                        color="gray.50"
                        _active={{}}
                        _hover={{}}
                        pos="absolute"
                        left="0"
                        transform={!isExpanded ? `translate3d(15px, 0, 0)` : undefined}
                        {...btnProps}
                        onClick={() => toggle()}
                    />
                </Box>
            </Box>
        );
    }
);

const AnimatedInput = animated(PseudoBox);
const AnimatedActionBtn = animated(ActionBtn);

const positionByDirection = {
    left: { left: "100%", transform: "translate3d(-100%, 0, 0)" },
    center: { left: "50%", transform: "translate3d(-50%, 0, 0)" },
    right: { left: "0%", transform: "none" },
};
const getInputBoxStyle = (direction: ExpandDirection) => positionByDirection[direction];

type ExpandDirection = "left" | "right" | "center";

export type ExpandableBtnWrapperProps = {
    isFloating?: boolean;
    // icon?: IconType | IconButtonProps["icon"];
};
