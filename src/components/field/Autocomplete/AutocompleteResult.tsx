import { Flex, PseudoBox, Text } from "@chakra-ui/core";
import { PseudoBoxProps } from "@chakra-ui/core/dist/PseudoBox";
import { cloneElement, isValidElement, ReactNode } from "react";

import { COMMON_COLORS } from "@/config/theme";

export type AutocompleteResultProps = PseudoBoxProps & {
    isDisabled?: boolean;
    colorMode: "light" | "dark";
    renderResult: ReactNode;
    actionBtn: ReactNode;
};

export function AutocompleteResult({
    renderResult,
    actionBtn,
    isDisabled,
    onClick,
    colorMode,
    ...props
}: AutocompleteResultProps) {
    const opacity = isDisabled ? 0.6 : 1;
    const renderedElement = isValidElement(renderResult) ? (
        cloneElement(renderResult, { opacity })
    ) : (
        <Text opacity={opacity}>{renderResult}</Text>
    );

    return (
        <PseudoBox
            as="li"
            p={2}
            fontSize="14px"
            transition="background-color 0.3s"
            _selected={{ backgroundColor: COMMON_COLORS.selected[colorMode] }}
            {...props}
            aria-disabled={isDisabled}
            onClick={!isDisabled ? onClick : null}
        >
            <Flex justify="space-between">
                {renderedElement}
                {isValidElement(actionBtn) && actionBtn}
            </Flex>
        </PseudoBox>
    );
}
