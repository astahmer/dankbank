import { Box, IconButtonProps, PseudoBox, PseudoBoxProps, useColorMode } from "@chakra-ui/core";
import { forwardRef, ForwardRefExoticComponent, PropsWithChildren, useRef } from "react";
import { IconType } from "react-icons/lib/cjs";
import { animated, config, useSpring } from "react-spring";

import { COMMON_COLORS } from "@/config/theme";
import { vwToPixel } from "@/functions/utils";
import { useClickOutside } from "@/hooks/dom";
import { useToggle } from "@/hooks/useToggle";

import { ActionBtn } from "./ActionBtn";
import { FloatingBtnProps } from "./FloatingBtn";

export type ExpandableBtnProps = FloatingBtnProps & { direction?: ExpandDirection };

export const ExpandableBtn = forwardRef<HTMLInputElement, ExpandableBtnProps>(
    ({ direction = "left", position = "absolute", ...props }, ref) => {
        const { colorMode } = useColorMode();

        const [isExpanded, { toggle, close }] = useToggle();
        const spring = useSpring({
            config: { tension: 320, friction: 32 },
            width: isExpanded ? `${vwToPixel(100) - 40}px` : "0px",
            opacity: isExpanded ? 1 : 0,
            borderRadius: "50px",
        });

        const { x } = useSpring({
            config: { tension: 400, friction: 31, duration: 50 },
            x: isExpanded ? -vwToPixel(100) + 40 + 48 : 0,
        });

        const selfRef = useRef<HTMLElement>();
        useClickOutside(selfRef, close);

        return (
            <Box position={position} w="48px" ref={selfRef}>
                <Box position="absolute" top="0" {...getInputBoxStyle(direction)}>
                    <AnimatedInput
                        h="48px"
                        bg={"gray.300"}
                        color={COMMON_COLORS.color["light"]}
                        _placeholder={{ color: "gray.500", fontSize: "0.9em" }}
                        {...props}
                        pl="56px"
                        pr="15px"
                        as="input"
                        ref={ref}
                        style={spring}
                    />
                </Box>
                <AnimatedActionBtn
                    size="lg"
                    bg={colorMode === "dark" ? "blue.500" : "blue.300"}
                    color="gray.50"
                    zIndex={1}
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    _focusWithin={{}}
                    {...props}
                    onClick={toggle as any}
                    style={{
                        transform: x.interpolate((x: number) => `translate3d(${x}px, 0px, 0px)`),
                    }}
                />
            </Box>
        );
    }
);

const AnimatedInput = animated(PseudoBox) as ForwardRefExoticComponent<
    PropsWithChildren<PseudoBoxProps & { type?: string }>
>;

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
    icon?: IconType | IconButtonProps["icon"];
};
