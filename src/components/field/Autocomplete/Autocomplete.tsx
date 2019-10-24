import {
    Box, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, InputLeftElement,
    List, Popover, PopoverBody, PopoverContent, Spinner, Stack as ChakraStack,
    Switch as ChakraSwitch, Text, useColorMode
} from "@chakra-ui/core";
import { IconProps } from "@chakra-ui/core/dist/Icon";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { StackProps } from "@chakra-ui/core/dist/Stack";
import { SwitchProps } from "@chakra-ui/core/dist/Switch";
import {
    ChangeEvent, FormEvent, forwardRef, FunctionComponent, KeyboardEvent, MouseEvent, Reducer,
    useCallback, useEffect, useMemo, useReducer, useRef, useState
} from "react";
import { IoMdClose } from "react-icons/io";

import { COMMON_COLORS } from "@/config/theme";
import { useHorizontalNav } from "@/functions/hooks/array/useHorizontalNav";
import { useSelection } from "@/functions/hooks/array/useSelection";
import { useVerticalNav } from "@/functions/hooks/array/useVerticalNav";
import { useClickOutside } from "@/functions/hooks/dom/useClickOutside";
import { AsyncRunReturn } from "@/functions/hooks/useAsync";
import { isDev, setRef, useEnhancedEffect } from "@/functions/utils";

import { AutogrowInput } from "../AutogrowInput";
import {
    AutocompleteActionPayload, AutocompleteInitialstate, IAutocompleteResponseTotal
} from "./Autocomplete.types";
import { AutocompleteItem } from "./AutocompleteItem";
import { AutocompleteResult } from "./AutocompleteResult";

export type AutocompleteProps<T = any> = InputProps & {
    onSelectionChange: (selecteds: T) => void;
    isLoading: boolean;
    suggestionFn: (value: string) => AsyncRunReturn<T>;
    displayFn: (item: T) => string;
    getId: (item: T) => string | number;
    label?: string;
    helpTxt?: string;
    emptyResultsTxt?: string;
    icon?: IconProps;
    shouldShowResultsOnFocus?: boolean;
    shouldHideLeftElementOnFocus?: boolean;
    withGhostSuggestion?: boolean;
};

export const Autocomplete = forwardRef<HTMLElement, AutocompleteProps>(
    (
        {
            onSelectionChange,
            isLoading,
            suggestionFn,
            displayFn,
            getId,
            label,
            helpTxt,
            emptyResultsTxt,
            icon,
            shouldShowResultsOnFocus,
            shouldHideLeftElementOnFocus,
            withGhostSuggestion,
            max,
            ...props
        }: AutocompleteProps,
        ref
    ) => {
        const { colorMode } = useColorMode();

        // Input value
        const [value, setValue] = useState("");
        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => setValue(event.currentTarget.value),
            []
        );

        const [isFocused, setIsFocused] = useState(null);
        const handleFocus = useCallback(() => {
            if (shouldShowResultsOnFocus) {
                openSuggestions();
            }
            setIsFocused(true);
        }, [shouldShowResultsOnFocus]);
        const handleBlur = useCallback(() => setIsFocused(false), []);

        // Is suggestions list open
        const [isOpen, setIsOpen] = useState(false);
        const openSuggestions = () => setIsOpen(true);
        const closeSuggestions = () => {
            setIsOpen(false);
            yNav.resetActive();
        };

        // Response state
        const [state, dispatch] = useReducer(reducer, initialState);
        const { error, items, total } = state;

        // Response state wrappers
        const setResponseState = (items: any[], total?: IAutocompleteResponseTotal) =>
            dispatch({ type: "SET_RESPONSE", value: { items, total } });
        const setError = (value: string) => dispatch({ type: "SET_ERROR", value });
        const onError = (error: any) => setError(error.message || error);

        // Call suggestionFn & set items/total
        const onValueChanged = async (value: string) => {
            const [err, response] = await suggestionFn(value);

            if (err) {
                if (isDev) {
                    console.error(err);
                }
                onError(err);
            }
            if (response) {
                setResponseState(response.items, response.total);
                setIsOpen(true);
            } else {
                if (isDev) {
                    console.warn("suggestionFn should return an object with <item> & <total> keys", response);
                }
            }
        };

        // When value changes, call suggestionFn if there is a value, else close suggestions list
        useEnhancedEffect(() => {
            if (value) {
                onValueChanged(value);
            } else {
                setResponseState([]);
                closeSuggestions();
            }
        }, [value]);

        // Either display loading or icon if there is any
        const leftElIcon = icon && icon.name ? <Icon {...icon} /> : null;
        const leftEl = isLoading ? <Spinner size="xs" /> : leftElIcon;

        // Used to keep focus on search input on suggestion list opening
        const inputRef = useRef<HTMLInputElement>();
        const focusInput = useCallback(() => inputRef.current.focus(), [inputRef]);

        const resultListRef = useRef(null);

        // Close suggestions on click outside of result list
        const ownRef = useRef<HTMLElement>((ref as any) as HTMLElement);
        const handleRef = useCallback((node) => setRef(ownRef, node), [ownRef]);
        useClickOutside(ownRef, closeSuggestions);

        // If shouldShowResultsOnFocus === false, allow to open current results using Up/Down
        const openListWithArrowKeys = useMemo(
            () =>
                !shouldShowResultsOnFocus
                    ? (event: KeyboardEvent) => {
                          if (items.length && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                              openSuggestions();
                          }
                      }
                    : null,
            [shouldShowResultsOnFocus, items]
        );

        // Selected item(s) from suggestions
        const [selecteds, selection] = useSelection({ getId, max });
        const toggleSelectedEventHandler = useCallback(
            (item: any) => (event: MouseEvent | FormEvent) => {
                event.preventDefault();
                selection.toggle(item);
                focusInput();
            },
            [selecteds]
        );
        const handleEnterKeyDown = useCallback((index: number) => selection.toggle(items[index]), [selecteds, items]);
        const resetEventHandler = useCallback((event: MouseEvent) => selection.reset(), []);

        // Allow navigation using Up & Down keys
        const [activeY, yNav] = useVerticalNav({
            hasList: items.length && isOpen,
            containerRef: resultListRef,
            activableSelector: "li",
            onEscapeKeyDown: closeSuggestions,
            onEnterKeyDown: handleEnterKeyDown,
            onKeyDownWithoutList: openListWithArrowKeys,
        });

        // When items change, reset active & activable items
        useEnhancedEffect(() => {
            yNav.resetActive();
            yNav.initActivableItems();
        }, [items]);

        const [activeX, xNav] = useHorizontalNav(selecteds.length, inputRef);

        // When selection change send it to parent & reset active
        useEffect(() => {
            xNav.reset();
            onSelectionChange(selecteds);
        }, [selecteds]);

        // Remove selected at x cursor (with Left/Right arrow keys) or last one using Backspace
        const removeSelectedAtCursor = useCallback(() => {
            if ((xNav.isMovingCursor || inputRef.current.selectionStart === 0) && selecteds.length) {
                const toRemove = xNav.isMovingCursor ? activeX : selecteds.length - 1;
                selection.remove(toRemove);
            }
        }, [selecteds.length, xNav.isMovingCursor, activeX, inputRef]);

        const handleKeyDown = useCallback(
            (event: KeyboardEvent) => {
                if (selecteds.length && event.key === "Backspace") {
                    removeSelectedAtCursor();
                } else {
                    xNav.onKeyDown(event);
                    yNav.onKeyDown(event);
                }
            },
            [selecteds.length, xNav.isMovingCursor, activeX, activeY]
        );

        // Render items & conditions
        const displayResultItems = useMemo(() => {
            return items.map((item, i) => (
                <AutocompleteResult
                    key={getId(item)}
                    colorMode={colorMode}
                    isDisabled={selection.has(item)}
                    onClick={toggleSelectedEventHandler(item)}
                    _selected={{ backgroundColor: COMMON_COLORS.selected[colorMode] }}
                    renderResult={displayFn(item)}
                    actionBtn={
                        <Switch
                            isChecked={selection.has(item)}
                            onClick={toggleSelectedEventHandler(item)}
                            onChange={() => {}}
                            size="sm"
                        />
                    }
                />
            ));
        }, [items, selecteds, colorMode]);
        const displayEmptyResult = (
            <Text p={2} fontSize="14px">
                {emptyResultsTxt}
            </Text>
        );
        const displayNoResults = value ? displayEmptyResult : null;
        const totalResults = getTotalResults(total);
        const shouldDisplayList = !isLoading && (value.length > 0 || items.length > 0);
        const shouldHideLeftEl = shouldHideLeftElementOnFocus && (isFocused || value || selecteds.length);

        const onCloseClick = useCallback(
            (i: number) => (e: MouseEvent) => {
                e.stopPropagation();
                selection.remove(i);
            },
            [selecteds]
        );
        const displaySelected = useMemo(() => {
            const isActiveSelected = (index: number) => index === activeX;

            return selecteds.map((tag, i) => (
                <AutocompleteItem
                    key={i}
                    pointerEvents="all"
                    label={displayFn(tag)}
                    isCurrent={isActiveSelected(i)}
                    onCloseClick={onCloseClick(i)}
                    marginRight="4px"
                    marginBottom="8px"
                />
            ));
        }, [selecteds, leftEl, activeX]);

        const Label = useCallback(() => makeLabel(label), [label]);
        const Help = useCallback(() => makeHelp(helpTxt), [helpTxt]);
        const Error = useCallback(() => makeError(error), [error]);

        const SelectedCount = useCallback(
            () => makeSelectedCount(shouldHideLeftElementOnFocus, selecteds.length, max),
            [selecteds.length, max]
        );
        const TotalCount = useCallback(() => makeTotalCount(items.length, totalResults), [items.length, totalResults]);

        // Ghost suggestion
        const inputContainerRef = useRef<HTMLElement>(null);
        const inputContainerLeft = inputContainerRef.current ? inputContainerRef.current.offsetLeft : 0;
        const ownWidth = ownRef.current ? ownRef.current.offsetWidth : 0;
        const ghostWidth = ownWidth - inputContainerLeft - 20; // 10px for left padding & 10 for spacing ghost
        const ghostIndex = activeY !== -1 ? activeY : 0;
        // Ghost will be visibile if there are results &
        // active Y cursor is either not defined or defined on a result not yet selected
        const shouldDisplayGhost =
            withGhostSuggestion &&
            items.length &&
            (activeY === -1 || (activeY !== -1 && !selection.has(items[activeY])));

        return (
            <Flex ref={handleRef} mt="10px" direction="column" onKeyDown={handleKeyDown}>
                <FormControl mb={5} isInvalid={!!error} pos="relative">
                    <Label />
                    {/* Bottom absolute elements */}
                    <Flex pos="absolute" top="100%" mt="2px" w="100%" justify="space-between" fontSize="10px">
                        <SelectedCount />
                        {shouldHideLeftElementOnFocus && isLoading ? (
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
                                style={shouldHideLeftEl ? { opacity: 0 } : {}}
                                transition="opacity 0.1s ease-out"
                                children={leftEl}
                            />
                        )}
                        {!isLoading && selecteds.length ? (
                            <Flex
                                onClick={selection.reset}
                                pos="absolute"
                                bottom="5px"
                                right="5px"
                                transform="translateX(100%)"
                            >
                                <Box as={IoMdClose} onClick={resetEventHandler} size="20px" />
                            </Flex>
                        ) : null}
                        <Flex
                            pointerEvents="none"
                            wrap="wrap"
                            align="center"
                            pl={leftEl ? marginLeft(shouldHideLeftElementOnFocus) : undefined}
                        >
                            {selecteds.length > 0 && displaySelected}
                            <Box ref={inputContainerRef} pos="relative">
                                <AutogrowInput
                                    variant="unstyled"
                                    {...props}
                                    pl={selecteds.length && "10px"}
                                    height="32px"
                                    tabIndex={0}
                                    forwardedRef={inputRef}
                                    value={value}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                {shouldDisplayGhost ? (
                                    <Box
                                        pos="absolute"
                                        left={selecteds.length && "10px"}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        textTransform="lowercase"
                                        fontSize="18px"
                                        mt="-1px"
                                        userSelect="none"
                                        opacity={0.4}
                                        style={{ width: ghostWidth }}
                                        isTruncated
                                    >
                                        <Text as="span" style={{ visibility: "hidden" }}>
                                            {displayFn(items[ghostIndex]).slice(0, value.length)}
                                        </Text>

                                        <Text as="span">{displayFn(items[ghostIndex]).slice(value.length)}</Text>
                                    </Box>
                                ) : null}
                            </Box>
                        </Flex>
                        <BorderBottom shouldHideLeftElementOnFocus={shouldHideLeftElementOnFocus} />
                    </Box>
                    <Help />
                    <Error />
                </FormControl>

                {shouldDisplayList && (
                    <Popover isOpen={isOpen} onClose={closeSuggestions} initialFocusRef={inputRef}>
                        <PopoverContent
                            zIndex={4}
                            w={`calc(100% - ${marginLeft(shouldHideLeftElementOnFocus)})`}
                            ml={marginLeft(shouldHideLeftElementOnFocus)}
                        >
                            <PopoverBody p={0}>
                                <List ref={resultListRef} spacing={2} maxH="33vh" overflowY="auto">
                                    {items.length ? displayResultItems : displayNoResults}
                                </List>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                )}
            </Flex>
        );
    }
);

Autocomplete.defaultProps = {
    size: "lg",
    emptyResultsTxt: "No results found.",
    shouldHideLeftElementOnFocus: true,
} as any;

Autocomplete.displayName = "Autocomplete";

const initialState: AutocompleteInitialstate = { error: "", items: [], total: null };
const reducer: Reducer<AutocompleteInitialstate, AutocompleteActionPayload> = (state, action) => {
    switch (action.type) {
        case "SET_RESPONSE":
            return { error: "", items: action.value.items || [], total: action.value.total || null };
        case "SET_ERROR":
            return { error: action.value, items: [], total: null };

        default:
            throw new Error("Action type is unknown");
    }
};

const getTotalResults = (total: IAutocompleteResponseTotal) => {
    if (!total) {
        return null;
    }

    if (typeof total === "number") {
        return total;
    } else {
        return total.value + (total.relation === "gte" ? "+" : "");
    }
};

const marginLeft = (shouldHideLeftElementOnFocus = true) => (shouldHideLeftElementOnFocus ? "0px" : "40px");

// Fix Chakra-UI typing mistake
const Stack = ChakraStack as FunctionComponent<StackProps & { wrap?: string }>;
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

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
const makeError = (error: string) => (error ? <FormErrorMessage>{error}</FormErrorMessage> : null);
