import { Box, BoxProps } from "@chakra-ui/core";
import { ReactNode } from "react";

import { ActionBtn } from "./";
import { ActionBtnProps } from "./ActionBtn";

export type FloatingBtnProps = ActionBtnProps & Optional<ChildrenProp> & { button?: ReactNode; boxProps?: BoxProps };

export function FloatingBtn({ children, button, boxProps, ...props }: FloatingBtnProps) {
    return (
        <Box position="fixed" right="70px" bottom="120px" zIndex={1} {...boxProps}>
            {children}
            {button || <ActionBtn {...props} />}
        </Box>
    );
}
