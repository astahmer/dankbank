import { Box } from "@chakra-ui/core";
import { ReactNode } from "react";

import { ActionBtn } from "./";
import { ActionBtnProps } from "./ActionBtn";

export type FloatingBtnProps = ActionBtnProps & Optional<ChildrenProp> & { button?: ReactNode };

export function FloatingBtn({ children, button, ...props }: FloatingBtnProps) {
    return (
        <Box position="fixed" right="70px" bottom="120px">
            {children}
            {button || <ActionBtn {...props} />}
        </Box>
    );
}
