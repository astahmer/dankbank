import {
    Box, Flex, FlexProps, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon,
    InputLeftElement, List, Popover as ChakraPopover, PopoverBody, PopoverContent, PopoverProps,
    Spinner, Switch as ChakraSwitch, SwitchProps, Text
} from "@chakra-ui/core";
import { IconProps } from "@chakra-ui/core/dist/Icon";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { forwardRef, FunctionComponent, ReactNode, useCallback, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IconType } from "react-icons/lib/cjs";

import { pick, setRef } from "@/functions/utils";
import { AsyncReset, AsyncRunReturn, UseAsyncState } from "@/hooks/async/useAsync";
import {
    useAutocomplete, UseAutocompleteProps, UseAutocompleteRefProps, UseAutocompleteReturnRefs,
    UseAutocompleteReturnValues
} from "@/hooks/form/useAutocomplete";

import { AutogrowInput } from "../AutogrowInput";
import { AutocompleteGhost } from "./AutocompleteGhost";
import { AutocompleteItem } from "./AutocompleteItem";
import { AutocompleteResult } from "./AutocompleteResult";

type AutocompleteResponse<T> = { items: T[]; total?: IAutocompleteResponseTotal };

export type AutocompleteProps<T = any, P = FlexProps> = P & {
    onSelectionChange: (selecteds: T) => void;
    async: UseAsyncState<AutocompleteResponse<T>>;
    reset: AsyncReset;
    suggestionFn: (value: string) => AsyncRunReturn<T>;
    displayFn: (item: T) => string;
    getId: (item: T) => string | number;
    createFn?: (value: string) => T;
    label?: string;
    helpTxt?: string;
    emptyResultsTxt?: string;
    icon?: IconProps | IconType;
    shouldShowResultsOnFocus?: boolean;
    shouldHideLeftElementOnFocus?: boolean;
    withGhostSuggestion?: boolean;
    delay?: number;
    placeholder?: InputProps["placeholder"];
    max?: InputProps["max"];
    isDisabled?: InputProps["isDisabled"];
    usePortal?: boolean;
};

export const Autocomplete = forwardRef<HTMLElement, AutocompleteProps>((props: AutocompleteProps, ref) => {
    const {
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
        ...rest
    } = props;

    // Used to keep focus on search input on suggestion list opening
    const inputRef = useRef<HTMLInputElement>();
    const focusInput = useCallback(() => inputRef.current.focus(), [inputRef]);

    // Suggestions container
    const [resultListRef, setResultList] = useState({ current: null });

    // Close suggestions on click outside of result list
    const ownRef = useRef<HTMLElement>((ref as any) as HTMLElement);
    const getRef = useCallback((node) => setRef(ownRef, node), []);

    // Main hook
    const [hook, bindings] = useAutocomplete(getArgs(props), { inputRef, resultListRef, ownRef });

    // Using a callback ref to update it whenever portal changes
    const getResultListRef = useCallback((element: HTMLElement) => setResultList({ current: element }), [hook.isOpen]);

    const {
        icon,
        helpTxt,
        emptyResultsTxt = "No results found",
        label,
        placeholder,
        fontSize = "1rem",
        ...wrapperProps
    } = rest;

    // Either display loading or icon if there is any
    const leftElIcon = icon ? (
        icon instanceof Function ? (
            <Box as={icon as IconType} size="24px" />
        ) : (
            <Icon {...icon} />
        )
    ) : null;
    const leftEl = async.isLoading ? <Spinner size="xs" /> : leftElIcon;

    // Render items & conditions
    const displayResultItems = async.data.items.map((item) => (
        <AutocompleteResult {...bindings.resultItem(item, <Switch size="sm" />)} />
    ));
    const displaySelecteds = hook.selecteds.map((item, index) => (
        <AutocompleteItem
            {...bindings.selectedItem(item, index)}
            pointerEvents="all"
            marginRight="4px"
            marginBottom="8px"
        />
    ));

    const displayEmptyResult = (
        <Text p={2} fontSize="14px">
            {emptyResultsTxt}
        </Text>
    );
    const displayNoResults = hook.value && async.isDone ? displayEmptyResult : null;

    const Label = useCallback(() => makeLabel(label), [label]);
    const Help = useCallback(() => makeHelp(helpTxt), [helpTxt]);
    const Error = useCallback(() => makeError(async.error), [async.error]);

    const SelectedCount = useCallback(
        () => makeSelectedCount(shouldHideLeftElementOnFocus, hook.selecteds.length, max),
        [hook.selecteds.length, max]
    );
    const TotalCount = useCallback(() => makeTotalCount(async.data.items.length, hook.totalResults), [
        async.data.items.length,
        hook.totalResults,
    ]);

    // Ghost suggestion
    const inputContainerRef = useRef<HTMLElement>(null);
    const inputContainerLeft = inputContainerRef.current ? inputContainerRef.current.offsetLeft : 0;
    const ownWidth = ownRef.current ? ownRef.current.offsetWidth : 0;
    const ghostWidth = ownWidth - inputContainerLeft - 20; // 10px for left padding & 10 for spacing ghost

    const bounds = ownRef.current && ownRef.current.getBoundingClientRect();
    const popoverStyle = process.browser &&
        bounds && {
            top: window.scrollY + bounds.top + bounds.height,
            left: bounds.left,
        };

    return (
        <Flex minW={250} {...wrapperProps} ref={getRef} direction="column" {...bindings.self}>
            <FormControl mt={5} isInvalid={!!async.error} pos="relative">
                <Label />
                {/* Top absolute elements */}
                <Flex pos="absolute" bottom="100%" mb="2px" w="100%" justify="space-between" fontSize="10px">
                    <SelectedCount />
                    {shouldHideLeftElementOnFocus && async.isLoading && !hook.timer ? (
                        <Spinner pos="absolute" left="50%" transform="translateX(-50%)" size="xs" />
                    ) : null}
                    <TotalCount />
                </Flex>
                <Box w="100%" pos="relative" onClick={focusInput}>
                    {leftEl && (
                        <InputLeftElement
                            size="md"
                            pos="absolute"
                            top="-4px"
                            left="-7px"
                            style={hook.shouldHideLeftEl ? { opacity: 0, pointerEvents: "none" } : {}}
                            transition="opacity 0.1s ease-out"
                            children={leftEl}
                        />
                    )}
                    {!async.isLoading && hook.selecteds.length ? (
                        <Flex
                            onClick={hook.selection.reset}
                            pos="absolute"
                            bottom="5px"
                            right="5px"
                            transform="translateX(100%)"
                        >
                            <Box as={IoMdClose} onClick={() => hook.selection.reset()} size="20px" />
                        </Flex>
                    ) : null}
                    <Flex
                        pointerEvents="none"
                        wrap="wrap"
                        align="center"
                        pl={leftEl ? marginLeft(shouldHideLeftElementOnFocus) : undefined}
                        overflow="hidden"
                    >
                        {hook.selecteds.length > 0 && displaySelecteds}
                        <Box ref={inputContainerRef} pos="relative">
                            <AutogrowInput
                                variant="unstyled"
                                pointerEvents="all"
                                pl={hook.selecteds.length && "10px"}
                                height="32px"
                                fontSize={fontSize}
                                tabIndex={0}
                                ref={inputRef}
                                hasIcon={!!leftEl}
                                placeholder={placeholder}
                                shouldHidePlaceholder={hook.shouldHideLeftEl}
                                textTransform="lowercase"
                                {...bindings.input}
                            />
                            {hook.shouldDisplayGhost ? (
                                <AutocompleteGhost
                                    left={hook.selecteds.length && "10px"}
                                    value={hook.value}
                                    fontSize={fontSize}
                                    ghostWidth={ghostWidth}
                                    ghostValue={displayFn(async.data.items[hook.ghostIndex])}
                                />
                            ) : null}
                        </Box>
                    </Flex>
                    <BorderBottom shouldHideLeftElementOnFocus={shouldHideLeftElementOnFocus} />
                </Box>
                <Help />
                <Error />
            </FormControl>

            {/* TODO replace popover par portal ? */}
            {hook.shouldDisplayList && (
                <Popover isOpen={hook.isOpen} onClose={hook.closeSuggestions} initialFocusRef={inputRef} usePortal>
                    <PopoverContent
                        zIndex={4}
                        w={`calc(100% - ${marginLeft(shouldHideLeftElementOnFocus)})`}
                        ml={marginLeft(shouldHideLeftElementOnFocus)}
                        position="absolute"
                        border="none"
                        style={popoverStyle}
                    >
                        <PopoverBody p={0}>
                            <List ref={getResultListRef} spacing={2} maxH="33vh" overflowY="auto">
                                {async.data.items.length ? displayResultItems : displayNoResults}
                            </List>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            )}
        </Flex>
    );
});

Autocomplete.displayName = "Autocomplete";

const marginLeft = (shouldHideLeftElementOnFocus = true) => (shouldHideLeftElementOnFocus ? "0px" : "40px");

// Fix Chakra-UI typing mistake
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;
const Popover = ChakraPopover as FunctionComponent<PopoverProps & { usePortal?: boolean }>;

// Wrappers to make simple components to keep in cache with useCallback
const BorderBottom = ({
    shouldHideLeftElementOnFocus,
}: {
    shouldHideLeftElementOnFocus: AutocompleteProps["shouldHideLeftElementOnFocus"];
}) => (
    <Box
        pos="absolute"
        bottom="0"
        ml={marginLeft(shouldHideLeftElementOnFocus)}
        borderBottom="1px"
        borderBottomColor="gray.300"
        style={{ width: `calc(100% - ${marginLeft(shouldHideLeftElementOnFocus)})`, height: "auto" }}
    ></Box>
);

const makeSelectedCount = (shouldHideLeftElementOnFocus: boolean, length: number, max: number | string) => (
    <Text ml={marginLeft(shouldHideLeftElementOnFocus)}>{length + (max ? "/" + max : "") + " selected"}</Text>
);
const makeTotalCount = (length: number, total: number | string) =>
    total ? <Text>{length + "/" + total + " results"}</Text> : null;

const makeLabel = (label: string) => (label ? <FormLabel>{label}</FormLabel> : null);
const makeHelp = (helpTxt: string) => (helpTxt ? <FormHelperText>{helpTxt}</FormHelperText> : null);
const makeError = (error: string | Error) =>
    error ? <FormErrorMessage>{typeof error === "string" ? error : error.message}</FormErrorMessage> : null;

export type IAutocompleteResponseTotal = { relation: string; value: number } | number;
export interface IAutocompleteResponse<T = any> {
    items: T[];
    total?: IAutocompleteResponseTotal;
}

export type AutocompleteWrapperProps<T = any, P = any> = Optional<AutocompleteProps<T, P>> & {
    setSelecteds: (selecteds: T) => void;
};
export type AutocompleteResultListRenderPropArg = UseAutocompleteReturnValues & {
    bind: UseAutocompleteReturnRefs["resultItem"];
    resultListRef: UseAutocompleteRefProps["resultListRef"];
};
export type AutocompleteResultListRenderProp = {
    resultList: (props: AutocompleteResultListRenderPropArg) => ReactNode;
};

export const getArgs = (props: AutocompleteProps) =>
    (pick(props, [
        "async",
        "displayFn",
        "max",
        "shouldHideLeftElementOnFocus",
        "reset",
        "suggestionFn",
        "createFn",
        "getId",
        "onSelectionChange",
        "delay",
        "shouldShowResultsOnFocus",
        "withGhostSuggestion",
        "isDisabled",
    ]) as any) as UseAutocompleteProps;
