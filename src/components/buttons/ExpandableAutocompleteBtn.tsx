import { Portal, Spinner } from "@chakra-ui/core";
import { useRef } from "react";

import { useAutocomplete } from "@/hooks/form";
import {
    AutocompleteWrapperProps, AutocompleteProps, AutocompleteWithPortal
} from "@/hooks/form/useAutocomplete";

import { ExpandableBtn, ExpandableBtnProps, ExpandableBtnWrapperProps } from "./ExpandableBtn";
import { FloatingBtn } from "./FloatingBtn";

export type ExpandableAutocompleteBtnProps<T = any> = AutocompleteProps<T> & {
    expandableProps?: ExpandableBtnProps & ExpandableBtnWrapperProps;
};

export function ExpandableAutocompleteBtn(props: ExpandableAutocompleteBtnProps) {
    const { data, display, fn, options, render, response } = props;
    const { btnProps, ...expandableProps } = props.expandableProps;

    const inputRef = useRef<HTMLInputElement>();
    const resultListRef = useRef<HTMLInputElement>();

    const [hook, bindings] = useAutocomplete(props, { inputRef, resultListRef, ownRef: inputRef });

    // Render items
    const Button = (
        <ExpandableBtn
            ref={inputRef}
            btnProps={{ type: "search" as any, ...btnProps }}
            {...expandableProps}
            {...bindings.input}
        />
    );
    const ResultList = () =>
        hook.shouldDisplayList && render.resultList
            ? (render.resultList({
                  ...hook,
                  items: data.items,
                  bind: bindings.resultItem,
                  resultListRef,
              }) as JSX.Element)
            : null;

    return (
        <div {...bindings.self}>
            {expandableProps.isFloating ? <FloatingBtn button={Button} /> : Button}
            {/* TODO displayEmptyResult renderProp ? */}
            {
                <Portal
                    isDisabled={!options.usePortal}
                    container={options.usePortal && (props.options as AutocompleteWithPortal).resultListContainer}
                    children={response.isLoading ? <Spinner size="lg" /> : <ResultList />}
                />
            }
        </div>
    );
}

export type ExpandableAutocompleteWrapperBtnProps<T = any> = OptionalExceptFor<
    ExpandableAutocompleteBtnProps<T>,
    "render"
> &
    AutocompleteWrapperProps<T>;
