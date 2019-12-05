import { Portal, Switch as ChakraSwitch, SwitchProps } from "@chakra-ui/core";
import { FunctionComponent, useRef } from "react";

import { useAutocomplete } from "@/hooks/form";

import {
    AutocompleteProps, AutocompleteResultListRenderProp, AutocompleteWrapperProps, getArgs
} from "../field/Autocomplete/Autocomplete";
import { ExpandableBtn, ExpandableBtnProps, ExpandableBtnWrapperProps } from "./ExpandableBtn";
import { FloatingBtn } from "./FloatingBtn";

export type ExpandableAutocompleteBtnProps<T = any> = AutocompleteProps<T, ExpandableBtnProps> &
    ExpandableBtnWrapperProps &
    AutocompleteResultListRenderProp;

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
        ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>();
    const resultListRef = useRef<HTMLInputElement>();

    const [hook, bindings] = useAutocomplete(getArgs(props), { inputRef, resultListRef, ownRef: inputRef });

    const {
        icon,
        helpTxt,
        emptyResultsTxt = "No results found",
        label,
        placeholder,
        fontSize = "1rem",
        ...wrapperProps
    } = rest;

    // Render items & conditions
    const Button = <ExpandableBtn ref={inputRef} label="Search" icon="search" {...wrapperProps} {...bindings.input} />;
    const ResultList = () =>
        hook.shouldDisplayList && resultList
            ? (resultList({ ...hook, bind: bindings.resultItem, resultListRef }) as JSX.Element)
            : null;

    return (
        <div {...bindings.self}>
            {isFloating ? <FloatingBtn button={Button} /> : Button}
            {/* TODO displayEmptyResult renderProp ? */}
            {usePortal ? <Portal children={<ResultList />} /> : <ResultList />}
        </div>
    );
}

// Fix Chakra-UI typing mistake
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

export type ExpandableAutocompleteWrapperBtnProps<T = any> = AutocompleteWrapperProps<T, ExpandableBtnProps> &
    ExpandableBtnWrapperProps &
    AutocompleteResultListRenderProp;
