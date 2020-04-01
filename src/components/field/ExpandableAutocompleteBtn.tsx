import { Box, Portal, Spinner, useColorMode } from "@chakra-ui/core";
import { useCallback, useMemo, useRef } from "react";
import { IoMdClose } from "react-icons/io";

import { COMMON_COLORS } from "@/config/theme";
import { useAutocomplete } from "@/hooks/form";
import { AutocompleteProps, AutocompleteWrapperProps } from "@/hooks/form/useAutocomplete";

import {
    ExpandableBtn, ExpandableBtnProps, ExpandableBtnRenderBottomProps, ExpandableBtnWrapperProps
} from "../buttons/ExpandableBtn";
import { FloatingBtn } from "../buttons/FloatingBtn";

export type ExpandableAutocompleteBtnProps<T = any> = Omit<AutocompleteProps<T>, "inputProps"> & {
    expandableProps?: ExpandableBtnProps & ExpandableBtnWrapperProps;
};

export function ExpandableAutocompleteBtn(props: ExpandableAutocompleteBtnProps) {
    const { data, options, render, response } = props;
    const { btnProps, inputProps, ...expandableProps } = props.expandableProps;

    const inputRef = useRef<HTMLInputElement>();
    const resultListRef = useRef<HTMLInputElement>();

    const [hook, bindings] = useAutocomplete(props, { inputRef, resultListRef, ownRef: inputRef });

    const canReset = useMemo(() => hook.value || hook.selecteds.length || data.items.length, [
        hook.value,
        hook.selecteds.length,
        data.items.length,
    ]);

    // Allow resetting input.value + hook.selecteds + response.data.items
    const reset = useCallback(
        (toggle: ExpandableBtnRenderBottomProps["toggle"]) => {
            response.resetFn();
            hook.selection.reset();
            hook.clearValue();
            toggle(false);
        },
        [canReset]
    );

    const { colorMode } = useColorMode();

    // Render items
    const Button = useMemo(
        () => (
            <ExpandableBtn
                ref={inputRef}
                btnProps={{
                    type: "search" as any,
                    boxShadow: data.items.length ? "0 0 1px 2px white" : undefined,
                    ...btnProps,
                }}
                inputProps={{ ...inputProps, ...bindings.input }}
                renderBottom={({ isExpanded, isReady, toggle }) =>
                    (isExpanded ? isReady : false) && canReset ? (
                        <Box
                            as={IoMdClose}
                            onClick={() => reset(toggle)}
                            size="24px"
                            pos="absolute"
                            top="50%"
                            right="0"
                            transform="translate3d(-50%, -50%, 0)"
                            color={COMMON_COLORS.bgColor[colorMode]}
                        />
                    ) : null
                }
                {...expandableProps}
            />
        ),
        [btnProps, inputProps, bindings.input, expandableProps, canReset]
    );
    const ResultList = useCallback(
        () =>
            hook.shouldDisplayList && render.resultList
                ? (render.resultList({
                      ...hook,
                      items: data.items,
                      bind: bindings.resultItem,
                      resultListRef,
                  }) as JSX.Element)
                : null,
        [hook.shouldDisplayList, render.resultList, data.items, bindings.resultItem]
    );

    return (
        <div {...bindings.self}>
            {props.render?.selectedList?.({ ...hook, bind: bindings.selectedItem })}
            <Portal
                isDisabled={!options.usePortal}
                container={options.usePortal && props.options.resultListContainer}
                children={response.isLoading ? <Spinner size="lg" /> : <ResultList />}
            />
            {expandableProps.isFloating ? <FloatingBtn button={Button} /> : Button}
        </div>
    );
}

export type ExpandableAutocompleteWrapperBtnProps<T = any> = OptionalExceptFor<
    ExpandableAutocompleteBtnProps<T>,
    "render"
> &
    AutocompleteWrapperProps<T>;
