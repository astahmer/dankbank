import { IconProps, InputProps, PortalProps, useColorMode } from "@chakra-ui/core";
import {
    ChangeEvent, cloneElement, ElementType, FormEvent, KeyboardEvent, MouseEvent, MutableRefObject,
    ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState
} from "react";
import { IconType } from "react-icons/lib/cjs";

import { COMMON_COLORS } from "@/config/theme";
import { useEnhancedEffect } from "@/functions/utils";
import { useHorizontalNav, useSelection, useVerticalNav } from "@/hooks/array/";
import { useDebounce } from "@/hooks/async/useDebounce";

import { SelectionActions } from "../array/useSelection";
import { AsyncReset, AsyncRunReturn } from "../async/useAsync";
import { useClickOutside } from "../dom";

export function useAutocomplete<T = any>(
    { data, fn, response, inputProps = {}, options = defaultOptions }: UseAutocompleteProps<T>,
    { ownRef, inputRef, resultListRef }: UseAutocompleteRefProps
): UseAutocompleteReturn<T> {
    const { colorMode } = useColorMode();
    // Input value
    const [value, setValue] = useState("");
    const clearValue = useCallback(() => {
        inputRef.current.value = "";
        setValue("");
    }, []);
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setValue(event.currentTarget.value), []);

    // Input focus
    const [isFocused, setIsFocused] = useState(null);
    const handleFocus = useCallback(() => {
        if (options.shouldShowResultsOnFocus) {
            openSuggestions();
        }

        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        xNav.reset();
        setIsFocused(true);
    }, [options.shouldShowResultsOnFocus]);
    // console.log(document.activeElement === inputRef.current);

    // Is suggestions list open
    const [isOpen, setIsOpen] = useState(false);
    const openSuggestions = useCallback(() => setIsOpen(true), []);
    const closeSuggestions = useCallback(() => {
        setIsOpen(false);
        yNav.resetActive();
    }, []);

    const [debounced, timer] = useDebounce(fn.suggestionFn, options.delay);
    const cancelOpening = useRef(null);

    // When value changes, call suggestionFn if there is a value, else reset & close suggestions list
    useEnhancedEffect(() => {
        if (value) {
            cancelOpening.current = false;
            debounced(value);
        } else {
            cancelOpening.current = true;
            options.shouldResetOnEmptyInput && response?.resetFn();
            closeSuggestions();
        }
    }, [value]);

    // On suggestionFn response
    useEffect(() => {
        if (data.items.length) {
            // If user already has selected an item, do not re-open suggestions
            // & instead reset results items since we cleared value on selection
            if (cancelOpening.current) {
                response?.resetFn();
            } else {
                openSuggestions();
            }
        }
    }, [data.items]);

    // Selected item(s) from suggestions
    const [selecteds, selection] = useSelection({ getId: fn.getId, max: Number(inputProps.max) });
    const toggleSelectedEventHandler = useCallback(
        (item: any) => (event: MouseEvent | FormEvent) => {
            event.preventDefault();
            selection.toggle(item);
        },
        [selecteds]
    );
    const handleEnterKeyDown = useCallback(
        (index: number) => {
            // Adding a selected (yNav) result item
            if (index !== -1) {
                selection.toggle(data.items[index]);
            } else if (fn.createFn && inputRef.current.value) {
                const newItem = fn.createFn(inputRef.current.value);
                const byText = (arrItem: any) => fn.displayFn(arrItem) === fn.displayFn(newItem);

                // Item is either a result with a text matching input current value or a new item
                const item = data.items.find(byText) || newItem;

                // Checks that selection doesn't already have this new item
                if (!selecteds.find(byText)) {
                    selection.add(item);
                }
            }
            clearValue();
        },
        [selecteds, data.items]
    );
    const handleTabKeyDown = useCallback(
        (index: number) => {
            const item = data.items[index !== -1 ? index : 0];
            if (item && !selection.has(item)) {
                updateNativeInputValue(inputRef, fn.displayFn(item));
            }
        },
        [data.items]
    );

    // If shouldShowResultsOnFocus === false, allow to open current results using Up/Down
    const openListWithArrowKeys = useMemo(
        () =>
            !options.shouldShowResultsOnFocus
                ? (event: KeyboardEvent) => {
                      if (data.items.length && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                          openSuggestions();
                      }
                  }
                : null,
        [options.shouldShowResultsOnFocus, data.items]
    );

    // Allow navigation using Up & Down keys
    const [activeY, yNav] = useVerticalNav({
        isOpen,
        containerRef: resultListRef,
        activableSelector: "li",
        onEscapeKeyDown: closeSuggestions,
        onEnterKeyDown: handleEnterKeyDown,
        onKeyDownWithoutList: openListWithArrowKeys,
    });

    const isMaxSelected = useMemo(() => selecteds.length >= inputProps.max, [selecteds, inputProps.max]);
    useEffect(() => {
        if (isMaxSelected) {
            closeSuggestions();
            clearValue();
        }
    }, [selecteds, inputProps.max]);

    const ghostIndex = useMemo(
        () => (!isFocused || isMaxSelected ? -1 : getGhostIndex(data.items, selecteds, fn.getId, activeY)),
        [data.items, selecteds, fn.getId, activeY, inputProps.max]
    );

    // When items change, reset active & activable items
    useEnhancedEffect(() => {
        yNav.resetActive();
        yNav.initActivableItems();
    }, [data.items]);

    const [activeX, xNav] = useHorizontalNav(selecteds.length, inputRef);

    // When selection change send it to parent & reset active
    useEffect(() => {
        xNav.reset();
        data.onSelectionChange(selecteds);
    }, [selecteds]);

    // Reset activeX & close suggestion if clicking outside
    const onClickOutside = useCallback(
        (event: MouseEvent) => {
            setIsFocused(false);

            if (ownRef.current && !ownRef.current.contains(event.target as Node)) {
                xNav.reset();
                // Also clicking outside of autocomplete component
                if (resultListRef.current && !resultListRef.current.contains(event.target as Node)) {
                    // Also clicking outside of result list
                    closeSuggestions();
                }
            }
        },
        [isFocused, options.resultListContainer]
    );
    useClickOutside(inputRef, onClickOutside);

    // Remove selected at x cursor (with Left/Right arrow keys) or last one using Backspace twice
    const removeSelectedAtCursor = useCallback(() => {
        if (!selecteds.length) {
            return;
        }

        // First time using backspace selects the last item, second actually removes it
        if (activeX === -1 && inputRef.current.selectionStart === 0) {
            xNav.setIsMovingCursor(true);
            xNav.cursorActions.set(selecteds.length - 1);
        } else if (xNav.isMovingCursor && activeX !== -1) {
            selection.remove(activeX);
        }
    }, [selecteds.length, xNav.isMovingCursor, activeX]);

    // Remove last element selected with Backspace, complete ghost suggestion with Tab or move activeX/Y
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (selecteds.length && event.key === "Backspace") {
                removeSelectedAtCursor();
            } else if (event.key === "Tab") {
                event.preventDefault();
                handleTabKeyDown(ghostIndex);
            } else {
                xNav.onKeyDown(event);
                yNav.onKeyDown(event);
            }
        },
        [selecteds.length, xNav.isMovingCursor, activeX, activeY, data.items]
    );

    const selectItem = useCallback(
        (i: number) => (e: MouseEvent) => {
            e.stopPropagation();
            if (activeX === i) {
                selection.remove(i);
                xNav.reset();
            } else {
                xNav.cursorActions.set(i);
            }
        },
        [selecteds, activeX]
    );
    const onCloseClick = useCallback(
        (i: number) => (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            selection.remove(i);
        },
        [selecteds]
    );

    // Bindings
    const bindSelf = { onKeyDown: handleKeyDown };
    const bindInput = {
        value,
        onChange: handleChange,
        onFocus: handleFocus,
        isDisabled: inputProps.isDisabled || isMaxSelected,
    };

    const bindResultItem = useCallback(
        (item: any, ActionBtn?: ReactElement) => ({
            key: fn.getId(item),
            colorMode,
            isDisabled: selection.has(item),
            onClick: toggleSelectedEventHandler(item),
            color: COMMON_COLORS.color[colorMode],
            _selected: { backgroundColor: COMMON_COLORS.selected[colorMode] },
            renderResult: fn.displayFn(item),
            actionBtn:
                ActionBtn &&
                cloneElement(ActionBtn, {
                    isChecked: selection.has(item),
                    onClick: toggleSelectedEventHandler(item),
                    onChange: () => {},
                }),
        }),
        [data.items, selecteds, colorMode]
    );

    const bindSelectedItem = useCallback(
        (tag, i) => ({
            key: i,
            label: fn.displayFn(tag),
            isCurrent: i === activeX,
            isDisabled: inputProps.isDisabled || isMaxSelected,
            onClick: selectItem(i),
            onCloseClick: onCloseClick(i),
        }),
        [selecteds, activeX]
    );

    // Computeds
    const shouldDisplayList = useMemo(() => !response.isLoading && (value.length > 0 || data.items.length > 0), [
        response.isLoading,
        value.length,
        data.items.length,
    ]);
    const shouldHideLeftEl = useMemo(
        () => options.shouldHideLeftElementOnFocus && (isFocused || value || selecteds.length),
        [options.shouldHideLeftElementOnFocus, isFocused, value, selecteds.length]
    );

    // Ghost will only be visible if there are results
    const shouldDisplayGhost = useMemo(
        () => !!(options.withGhostSuggestion && data.items.length && value && data.items[ghostIndex]),
        [options.withGhostSuggestion, data.items.length, value, ghostIndex]
    );

    const returnValues = useMemo(
        () => ({
            value,
            selecteds,
            selection,
            activeX,
            activeY,
            ghostIndex,
            timer,
            isOpen,
            closeSuggestions,
            shouldDisplayList,
            shouldHideLeftEl,
            shouldDisplayGhost,
        }),
        [
            value,
            selecteds,
            selection,
            activeX,
            activeY,
            ghostIndex,
            timer,
            isOpen,
            closeSuggestions,
            shouldDisplayList,
            shouldHideLeftEl,
            shouldDisplayGhost,
        ]
    );
    const refs = useMemo(
        () => ({ self: bindSelf, input: bindInput, resultItem: bindResultItem, selectedItem: bindSelectedItem }),
        [bindSelf, bindInput, bindResultItem, bindSelectedItem]
    );

    return [returnValues, refs];
}

const getGhostIndex = (
    items: any[],
    selecteds: any[],
    getId: AutocompleteFnProps["getId"],
    activeY: number
): number => {
    if (!items.length) {
        return -1;
    }

    let ghostIndex = activeY !== -1 ? activeY : 0;
    if (items[ghostIndex]) {
        const id = getId(items[ghostIndex]);
        const selected = selecteds.findIndex((item) => getId(item) === id);

        if (selected !== -1) {
            return activeY + 1 < items.length ? getGhostIndex(items, selecteds, getId, activeY + 1) : -1;
        }

        return ghostIndex;
    }

    return activeY + 1 < items.length ? getGhostIndex(items, selecteds, getId, activeY + 1) : -1;
};

const updateNativeInputValue = (inputRef: MutableRefObject<HTMLInputElement>, value: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(inputRef.current, value);

    const changeEvent = new Event("input", { bubbles: true });
    inputRef.current.dispatchEvent(changeEvent);
};

export type UseAutocompleteRefProps = {
    ownRef: MutableRefObject<HTMLElement>;
    inputRef: MutableRefObject<HTMLInputElement>;
    resultListRef: MutableRefObject<HTMLElement>;
};
export type UseAutocompleteProps<T = any> = {
    data: Pick<AutocompleteDataProps, "onSelectionChange" | "items">;
    response: Pick<AutocompleteResponseProps, "isLoading" | "resetFn">;
    fn: AutocompleteFnProps<T>;
    options?: Omit<AutocompleteOptionsProps, "usePortal">;
    inputProps?: InputProps;
};

export type UseAutocompleteReturnValues<T = any> = {
    value: string;
    selecteds: T[];
    selection: SelectionActions<T>;
    activeX: ReturnType<typeof useHorizontalNav>[0];
    activeY: ReturnType<typeof useVerticalNav>[0];
    ghostIndex: number;
    timer: number;
    isOpen: boolean;
    closeSuggestions: () => void;
    shouldDisplayList: boolean;
    shouldHideLeftEl: boolean;
    shouldDisplayGhost: boolean;
};
export type UseAutocompleteReturnRefs<T = any> = {
    self: {
        onKeyDown: (event: KeyboardEvent<Element>) => void;
    };
    input: {
        value: string;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        isDisabled: boolean;
    };
    resultItem: (
        item: T,
        ActionBtn?: ReactElement
    ) => {
        key: string | number;
        colorMode: "light" | "dark";
        isDisabled: boolean;
        onClick: (event: MouseEvent | FormEvent<Element>) => void;
        color: string;
        _selected: { backgroundColor: string };
        renderResult: string;
        actionBtn: ReactElement;
    };
    selectedItem: (
        tag: T,
        i: any
    ) => {
        key: string | number;
        label: string;
        isCurrent: boolean;
        isDisabled: boolean;
        onClick: (e: MouseEvent) => void;
        onCloseClick: (e: MouseEvent) => void;
    };
};
export type UseAutocompleteReturn<T = any> = [UseAutocompleteReturnValues<T>, UseAutocompleteReturnRefs<T>];

export const defaultOptions = {
    delay: 180,
    shouldHideLeftElementOnFocus: true,
    shouldShowResultsOnFocus: true,
    shouldResetOnEmptyInput: true,
    withGhostSuggestion: true,
};

export type AutocompleteProps<T = any> = {
    data: AutocompleteDataProps<T>;
    response: AutocompleteResponseProps;
    fn: AutocompleteFnProps<T>;
    render?: AutocompleteRendersProps;
    display?: AutocompleteDisplayProps;
    inputProps?: InputProps;
    options?: AutocompleteOptionsProps;
};

export type AutocompleteRendersProps = {
    wrapperElement?: ElementType;
    autocompleteInput?: (props: any) => ReactNode;
    resultList?: (props: AutocompleteResultListRenderPropArg) => ReactNode;
    loader?: () => ReactNode;
};
export type AutocompleteDataProps<T = any> = {
    onSelectionChange: (selecteds: T[]) => void;
    items: T[];
    total: number;
};
export type AutocompleteResponseProps = {
    isLoading: boolean;
    isDone: boolean;
    error: string | Error;
    resetFn: AsyncReset;
};
export type AutocompleteFnProps<T = any> = {
    suggestionFn: (value: string) => AsyncRunReturn<T>;
    displayFn: (item: T) => string;
    getId: (item: T) => string | number;
    createFn?: (value: string) => T;
};
export type AutocompleteDisplayProps = {
    label?: string;
    helpTxt?: string;
    emptyResultsTxt?: string;
    icon?: string | IconProps | IconType;
};
export type AutocompleteOptionsCommonProps = {
    // usePortal?: boolean;
    shouldShowResultsOnFocus?: boolean;
    shouldHideLeftElementOnFocus?: boolean;
    shouldResetOnEmptyInput?: boolean;
    withGhostSuggestion?: boolean;
    delay?: number;
};
// export type AutocompleteOptionsProps = AutocompleteOptionsCommonProps & AutocompletePortalProps;
export type AutocompleteOptionsProps = AutocompleteOptionsCommonProps & {
    usePortal?: boolean;
    resultListContainer?: PortalProps["container"];
};

export type AutocompleteWithPortal = { usePortal?: true; resultListContainer: PortalProps["container"] };
export type AutocompleteWithoutPortal = { usePortal?: false };
export type AutocompletePortalProps = AutocompleteWithPortal | AutocompleteWithoutPortal;

export type AutocompleteResponse<T> = { items: T[]; total: number };

export type AutocompleteWrapperProps<T = any> = {
    setSelecteds: (selecteds: T[]) => void;
};
export type AutocompleteResultListRenderPropArg<T = any> = UseAutocompleteReturnValues<T> & {
    items: T[];
    bind: UseAutocompleteReturnRefs<T>["resultItem"];
    resultListRef: UseAutocompleteRefProps["resultListRef"];
};
export type AutocompleteResultListRenderProp<T = any> = {
    resultList?: (props: AutocompleteResultListRenderPropArg<T>) => ReactNode;
};
