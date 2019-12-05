import { Box, PseudoBox, useColorMode } from "@chakra-ui/core";
import { forwardRef } from "react";
import { animated, useSpring } from "react-spring";

import { COMMON_COLORS } from "@/config/theme";
import { vwToPixel } from "@/functions/utils";
import { useToggle } from "@/hooks/useToggle";

import { ActionBtn } from "./ActionBtn";
import { FloatingBtnProps } from "./FloatingBtn";

export type ExpandableBtnProps = FloatingBtnProps & { direction?: ExpandDirection };

export const ExpandableBtn = forwardRef<HTMLInputElement, ExpandableBtnProps>(
    ({ direction = "left", position = "absolute", ...props }, ref) => {
        const { colorMode } = useColorMode();

        const [isExpanded, { toggle }] = useToggle();
        const spring = useSpring({
            config: { tension: 320, friction: 26 },
            width: isExpanded ? `${vwToPixel(100) - 40}px` : "0px",
            opacity: isExpanded ? 1 : 0,
            paddingRight: isExpanded ? "48px" : "0px",
            borderRadius: "50px",
        });

        return (
            <Box position={position} w="48px">
                <Box position="absolute" top="0" {...getInputBoxStyle(direction)}>
                    <AnimatedInput
                        h="48px"
                        pl="20px"
                        bg={"gray.300"}
                        color={COMMON_COLORS.color["light"]}
                        {...props}
                        as="input"
                        ref={ref}
                        style={spring}
                    />
                </Box>
                <ActionBtn
                    size="lg"
                    bg={colorMode === "dark" ? "blue.500" : "blue.300"}
                    color="gray.50"
                    zIndex={1}
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    _focusWithin={{}}
                    {...props}
                    onClick={toggle}
                />
            </Box>
        );
    }
);

const AnimatedInput = animated(PseudoBox);

const positionByDirection = {
    left: { left: "100%", transform: "translate3d(-100%, 0, 0)" },
    center: { left: "50%", transform: "translate3d(-50%, 0, 0)" },
    right: { left: "0%", transform: "none" },
};
const getInputBoxStyle = (direction: ExpandDirection) => positionByDirection[direction];

type ExpandDirection = "left" | "right" | "center";

export type ExpandableBtnWrapperProps = Omit<Optional<ExpandableBtnProps>, "icon"> & { isFloating?: boolean };
