import { Portal, PortalProps } from "@chakra-ui/core";
import { useRef } from "react";

import { useAutocomplete } from "@/hooks/form";

import {
    AutocompleteResultListRenderProp, AutocompleteWrapperProps, BaseAutocompleteProps, getArgs
} from "../field/Autocomplete/Autocomplete";
import { ExpandableBtn, ExpandableBtnProps, ExpandableBtnWrapperProps } from "./ExpandableBtn";
import { FloatingBtn } from "./FloatingBtn";

export type ExpandableAutocompleteBtnProps<T = any> = Omit<BaseAutocompleteProps<T>, "helpTxt" | "icon"> &
    ExpandableBtnProps &
    ExpandableBtnWrapperProps &
    AutocompleteResultListRenderProp<T> &
    Pick<PortalProps, "container" | "onRendered">;

export function ExpandableAutocompleteBtn(props: ExpandableAutocompleteBtnProps) {
    const {
        isFloating,
        resultList,
        displayFn,
        max,
        shouldHideLeftElementOnFocus = true,
        async,
        reset,
        suggestionFn,
        createFn,
        getId,
        onSelectionChange,
        delay,
        shouldShowResultsOnFocus,
        withGhostSuggestion,
        isDisabled,
        usePortal,
        container,
        onRendered,
        ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>();
    const resultListRef = useRef<HTMLInputElement>();

    const [hook, bindings] = useAutocomplete(getArgs(props), { inputRef, resultListRef, ownRef: inputRef });

    const { emptyResultsTxt = "No results found", ...wrapperProps } = rest;

    // Render items & conditions
    const Button = <ExpandableBtn ref={inputRef} type={"search" as any} {...wrapperProps} {...bindings.input} />;
    const ResultList = () =>
        hook.shouldDisplayList && resultList
            ? (resultList({
                  ...hook,
                  items: async.data.items,
                  bind: bindings.resultItem,
                  resultListRef,
              }) as JSX.Element)
            : null;

    return (
        <div {...bindings.self}>
            {isFloating ? <FloatingBtn button={Button} /> : Button}
            {/* TODO displayEmptyResult renderProp ? */}
            {/* {usePortal ? <Portal container={container} children={<ResultList />} /> : <ResultList />} */}
            {<Portal isDisabled={!usePortal} onRendered={onRendered} container={container} children={<ResultList />} />}
        </div>
    );
}

// export type ExpandableAutocompleteWrapperBtnProps<T = any> = Overwrite<
//     Optional<ExpandableAutocompleteBtnProps<T>> & AutocompleteWrapperProps<T>,
//     ExpandableAutocompleteBtnProps["resultList"]
// >;
export type ExpandableAutocompleteWrapperBtnProps<T = any> = OptionalExceptFor<
    ExpandableAutocompleteBtnProps<T>,
    "resultList"
> &
    AutocompleteWrapperProps<T>;
