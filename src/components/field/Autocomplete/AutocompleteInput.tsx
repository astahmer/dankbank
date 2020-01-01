import {
    Box, BoxProps, Flex, FormErrorMessage, FormHelperText, FormLabel, InputLeftElement, List,
    Portal, Spinner, Switch as ChakraSwitch, SwitchProps, Text, useColorMode
} from "@chakra-ui/core";
import { forwardRef, FunctionComponent, useCallback, useMemo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { CustomIcon } from "@/components/common/CustomIcon";
import { setRef } from "@/functions/utils";
import { AutocompleteProps, defaultOptions, useAutocomplete } from "@/hooks/form/useAutocomplete";
import { useCombinedRefs } from "@/hooks/useCombinedRefs";

import { AutogrowInput } from "../AutogrowInput";
import { InputWithGhost } from "../InputWithGhost";
import { AutocompleteItem } from "./AutocompleteItem";
import { AutocompleteResult } from "./AutocompleteResult";

export type AutocompleteInputProps<T = any> = { boxProps: BoxProps } & AutocompleteProps<T>;

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
    (props: AutocompleteInputProps, ref) => {
        const { boxProps, data, display, fn, inputProps = {}, options = defaultOptions, response } = props;

        // Used to keep focus on search input on suggestion list opening
        const innerRef = useRef<HTMLInputElement>();
        const inputRef = useCombinedRefs<HTMLInputElement>(ref, innerRef);
        const focusInput = useCallback(() => inputRef.current.focus(), [inputRef]);

        // Suggestions container
        const [resultListRef, setResultList] = useState({ current: null });

        // Close suggestions on click outside of result list
        const ownRef = useRef<HTMLElement>(); //(ref as any) as HTMLElement
        const getRef = useCallback((node) => setRef(ownRef, node), []);

        // Main hook
        const [hook, bindings] = useAutocomplete({ data, response, fn, options }, { inputRef, resultListRef, ownRef });

        // Using a callback ref to update it whenever portal changes
        const getResultListRef = useCallback((element: HTMLElement) => setResultList({ current: element }), [
            hook.shouldDisplayList,
        ]);

        const { colorMode } = useColorMode();

        // Either display loading or icon if there is any
        const leftElIcon = display.icon ? <CustomIcon icon={display.icon} size="24px" /> : null;
        const leftEl = response.isLoading ? <Spinner size="xs" /> : leftElIcon;

        // Render items & conditions
        const displayResultItems = useMemo(
            () => data.items.map((item) => <AutocompleteResult {...bindings.resultItem(item, <Switch size="sm" />)} />),
            [data.items, bindings.resultItem]
        );
        const displaySelecteds = useMemo(
            () =>
                hook.selecteds.map((item, index) => (
                    <AutocompleteItem
                        {...bindings.selectedItem(item, index)}
                        pointerEvents="all"
                        marginRight="4px"
                        marginBottom="8px"
                    />
                )),
            [hook.selecteds, bindings.selectedItem]
        );

        const displayEmptyResult = useMemo(
            () => (
                <Text p={2} fontSize="14px">
                    {display.emptyResultsTxt || "No results found"}
                </Text>
            ),
            [display.emptyResultsTxt]
        );
        const displayNoResults = hook.value && response.isDone ? displayEmptyResult : null;

        const ml = useMemo(() => marginLeft(options?.shouldHideLeftElementOnFocus), [
            options?.shouldHideLeftElementOnFocus,
        ]);
        const Label = useCallback(() => makeLabel(display.label), [display.label]);
        const Help = useCallback(() => makeHelp(display.helpTxt), [display.helpTxt]);
        const Error = useCallback(() => makeError(response.error), [response.error]);

        const SelectedCount = useCallback(() => makeSelectedCount(ml, hook.selecteds.length, inputProps.max), [
            hook.selecteds.length,
            inputProps.max,
        ]);
        const TotalCount = useCallback(() => makeTotalCount(data.items.length, data.total), [
            data.items.length,
            data.total,
        ]);

        // Suggestions list position
        const bounds = ownRef.current && ownRef.current.getBoundingClientRect();
        const popoverStyle = process.browser &&
            bounds && {
                top: window.scrollY + bounds.top + bounds.height,
                left: bounds.left,
            };

        return (
            <Box mt={30} pos="relative" minW={250} {...boxProps} ref={getRef} {...bindings.self}>
                <Label />
                {/* Top absolute elements */}
                <Flex pos="absolute" bottom="100%" mb="2px" w="100%" justify="space-between" fontSize="10px">
                    <SelectedCount />
                    {options?.shouldHideLeftElementOnFocus && response.isLoading && !hook.timer ? (
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
                    {!response.isLoading && hook.selecteds.length ? (
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
                        pl={leftEl ? ml : undefined}
                        overflow="hidden"
                    >
                        {hook.selecteds.length > 0 && displaySelecteds}
                        <InputWithGhost
                            shouldDisplayGhost={hook.shouldDisplayGhost}
                            containerWidth={ownRef.current && ownRef.current.offsetWidth}
                            ghostProps={{
                                value: hook.value,
                                ghostValue:
                                    options?.withGhostSuggestion &&
                                    hook.shouldDisplayGhost &&
                                    fn.displayFn(data.items[hook.ghostIndex]),
                                left: hook.selecteds.length && "10px",
                                fontSize: (boxProps && boxProps.fontSize) || "1rem",
                            }}
                            input={
                                <AutogrowInput
                                    variant="unstyled"
                                    pointerEvents="all"
                                    pl={hook.selecteds.length && "10px"}
                                    height="32px"
                                    fontSize={(boxProps && boxProps.fontSize) || "1rem"}
                                    tabIndex={0}
                                    textTransform="lowercase"
                                    {...inputProps}
                                    ref={inputRef}
                                    hasIcon={!!leftEl}
                                    shouldHidePlaceholder={hook.shouldHideLeftEl}
                                    {...bindings.input}
                                />
                            }
                        />
                    </Flex>
                    <BorderBottom ml={ml} />
                </Box>
                <Help />
                <Error />
                <Portal
                    children={
                        <>
                            {hook.shouldDisplayList && hook.isOpen && (
                                <Box
                                    bg={colorMode === "dark" ? "gray.600" : "gray.300"}
                                    color={colorMode === "dark" ? "gray.50" : "gray.600"}
                                    w={`calc(${ownRef.current.clientWidth}px - ${ml})`}
                                    ml={ml}
                                    position="absolute"
                                    border="none"
                                    style={popoverStyle}
                                >
                                    <List ref={getResultListRef} spacing={2} maxH="33vh" overflowY="auto">
                                        {data.items.length ? displayResultItems : displayNoResults}
                                    </List>
                                </Box>
                            )}
                        </>
                    }
                />
            </Box>
        );
    }
);

AutocompleteInput.displayName = "AutocompleteInput";

const marginLeft = (shouldHideLeftElementOnFocus = true) => (shouldHideLeftElementOnFocus ? "0px" : "40px");

// Fix Chakra-UI typing mistake
const Switch = ChakraSwitch as FunctionComponent<Optional<SwitchProps, "children">>;

// Wrappers to make simple components to keep in cache with useCallback
const BorderBottom = ({ ml }: { ml: BoxProps["ml"] }) => (
    <Box
        pos="absolute"
        bottom="0"
        ml={ml}
        borderBottom="1px"
        borderBottomColor="gray.300"
        style={{ width: `calc(100% - ${ml})`, height: "auto" }}
    ></Box>
);

const makeSelectedCount = (ml: BoxProps["ml"], length: number, max: number | string) => (
    <Text ml={ml}>{length + (max ? "/" + max : "") + " selected"}</Text>
);
const makeTotalCount = (length: number, total: number | string) =>
    total ? <Text>{length + "/" + total + " results"}</Text> : null;

const makeLabel = (label: string) => (label ? <FormLabel>{label}</FormLabel> : null);
const makeHelp = (helpTxt: string) => (helpTxt ? <FormHelperText>{helpTxt}</FormHelperText> : null);
const makeError = (error: string | Error) =>
    error ? <FormErrorMessage>{typeof error === "string" ? error : error.message}</FormErrorMessage> : null;
