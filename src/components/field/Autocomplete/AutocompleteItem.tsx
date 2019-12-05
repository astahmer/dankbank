import { DefaultTheme, theme as ChakraTheme } from "@chakra-ui/core";
import { MouseEventHandler } from "react";

import { ClosableTag, ClosableTagProps } from "@/components/buttons/ClosableTag";

export type AutocompleteItemProps = ClosableTagProps & {
    label: string;
    isCurrent?: boolean;
    isDisabled?: boolean;
    onCloseClick?: MouseEventHandler;
};

const theme = (ChakraTheme as any) as DefaultTheme;

export function AutocompleteItem({ label, isCurrent, isDisabled, onCloseClick, ...props }: AutocompleteItemProps) {
    return (
        <ClosableTag
            css={{
                '&[aria-disabled="true"]': {
                    backgroundColor: theme.colors.cyan[800],
                    color: "white",
                },
                '&[aria-current="true"]': {
                    backgroundColor: theme.colors.red["300"],
                    color: "white",
                },
                userSelect: "none",
                backgroundColor: theme.colors.cyan[600],
            }}
            {...props}
            label={label}
            onCloseClick={onCloseClick}
            aria-current={isCurrent}
            aria-disabled={isDisabled}
        />
    );
}
