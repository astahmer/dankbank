import { Box, BoxProps, Stack, StackProps } from "@chakra-ui/core";
import { MouseEventHandler } from "react";

import { ModalBtn, ModalBtnProps } from "./ModalBtn";

export type MenuModalBtnProps = Omit<ModalBtnProps, "children"> & {
    items: MenuItem[];
    stackProps?: StackProps;
    boxProps?: BoxProps;
};
export type MenuItem = { label: string; onClick: MouseEventHandler; hidden?: boolean };

export function MenuModalBtn({ items, stackProps, boxProps, ...props }: MenuModalBtnProps) {
    return (
        <ModalBtn {...props}>
            <Stack direction="column" spacing={6} {...stackProps}>
                {items &&
                    items
                        .filter((item) => !item.hidden)
                        .map((item, i) => (
                            <Box key={i} {...boxProps} onClick={item.onClick}>
                                {item.label}
                            </Box>
                        ))}
            </Stack>
        </ModalBtn>
    );
}
