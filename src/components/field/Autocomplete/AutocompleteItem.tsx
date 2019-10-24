import { useTheme } from "@chakra-ui/core";
import { MouseEventHandler } from "react";

import { ClosableTag, ClosableTagProps } from "@/components/buttons/ClosableTag";

export type AutocompleteItemProps = ClosableTagProps & {
    label: string;
    isCurrent?: boolean;
    onCloseClick?: MouseEventHandler;
};

export function AutocompleteItem({ label, isCurrent, onCloseClick, ...props }: AutocompleteItemProps) {
    const theme = useTheme() as any;

    return (
        <ClosableTag
            css={{
                '&[aria-current="true"]': {
                    backgroundColor: theme.colors.red["300"],
                    color: "white",
                },
            }}
            {...props}
            label={label}
            onCloseClick={onCloseClick}
            aria-current={isCurrent}
        />
    );
}
