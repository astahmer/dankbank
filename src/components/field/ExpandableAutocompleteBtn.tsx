import { Portal, Spinner } from "@chakra-ui/core";
import { useRef } from "react";

import { useAutocomplete } from "@/hooks/form";
import { AutocompleteProps, AutocompleteWrapperProps } from "@/hooks/form/useAutocomplete";

import {
    ExpandableBtn, ExpandableBtnProps, ExpandableBtnWrapperProps
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

    // Render items
    const Button = (
        <ExpandableBtn
            ref={inputRef}
            btnProps={{ type: "search" as any, ...btnProps }}
            inputProps={{ ...inputProps, ...bindings.input }}
            {...expandableProps}
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
                    container={options.usePortal && props.options.resultListContainer}
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
