import { useColorMode } from "@chakra-ui/core";
import {
    ChangeEvent, cloneElement, FormEvent, KeyboardEvent, MouseEvent, MutableRefObject, ReactElement,
    useCallback, useEffect, useMemo, useRef, useState
} from "react";

import {
    AutocompleteProps, IAutocompleteResponseTotal
} from "@/components/field/Autocomplete/Autocomplete";
import { COMMON_COLORS } from "@/config/theme";
import { isDev, useEnhancedEffect } from "@/functions/utils";
import { useHorizontalNav, useSelection, useVerticalNav } from "@/hooks/array/";
import { useDebounce } from "@/hooks/async/useDebounce";
import { useClickOutside } from "@/hooks/dom/useClickOutside";

import { SelectionActions } from "../array/useSelection";

export function useAutocomplete<T = any>(
    {
        onSelectionChange,
        async,
        reset,
        suggestionFn,
        displayFn,
        getId,
        createFn,
        shouldShowResultsOnFocus = true,
        shouldHideLeftElementOnFocus = true,
        withGhostSuggestion = true,
        max = 20,
        delay = 180,
        isDisabled,
    }: UseAutocompleteProps<T>,
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
        if (shouldShowResultsOnFocus) {
            openSuggestions();
        }

        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        xNav.reset();
        setIsFocused(true);
    }, [shouldShowResultsOnFocus]);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    // Is suggestions list open
    const [isOpen, setIsOpen] = useState(false);
    const openSuggestions = useCallback(() => setIsOpen(true), []);
    const closeSuggestions = useCallback(() => {
        setIsOpen(false);
        yNav.resetActive();
    }, []);

    // Response state
    const { items, total } = async.data;

    const [debounced, timer] = useDebounce(suggestionFn, delay);
    const cancelOpening = useRef(null);

    // When value changes, call suggestionFn if there is a value, else reset & close suggestions list
    useEnhancedEffect(() => {
        if (value) {
            cancelOpening.current = false;
            debounced(value);
        } else {
            cancelOpening.current = true;
            reset();
            closeSuggestions();
        }
    }, [value]);

    // On suggestionFn response
    useEffect(() => {
        if (async.data) {
            // If response doesn't have an "items" key, ignore it
            if (!async.data.items && isDev) {
                console.warn("suggestionFn should return an object with <item> & <total> keys", async.data);
                return;
            }

            if (async.data.items.length) {
                // If user already has selected an item, do not re-open suggestions
                // & instead reset results items since we cleared value on selection
                if (cancelOpening.current) {
                    reset();
                } else {
                    openSuggestions();
                }
            }
        }
    }, [async.data]);

    // Selected item(s) from suggestions
    const [selecteds, selection] = useSelection({ getId, max: Number(max) });
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
                selection.toggle(items[index]);
            } else if (createFn && inputRef.current.value) {
                const newItem = createFn(inputRef.current.value);
                const byText = (arrItem: any) => displayFn(arrItem) === displayFn(newItem);

                // Item is either a result with a text matching input current value or a new item
                const item = items.find(byText) || newItem;

                // Checks that selection doesn't already have this new item
                if (!selecteds.find(byText)) {
                    selection.add(item);
                }
            }
            clearValue();
        },
        [selecteds, items]
    );
    const handleTabKeyDown = useCallback(
        (index: number) => {
            const item = items[index !== -1 ? index : 0];
            if (item && !selection.has(item)) {
                updateNativeInputValue(inputRef, displayFn(item));
            }
        },
        [items]
    );

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

    // Allow navigation using Up & Down keys
    const [activeY, yNav] = useVerticalNav({
        isOpen,
        containerRef: resultListRef,
        activableSelector: "li",
        onEscapeKeyDown: closeSuggestions,
        onEnterKeyDown: handleEnterKeyDown,
        onKeyDownWithoutList: openListWithArrowKeys,
    });

    const isMaxSelected = selecteds.length >= max;
    useEffect(() => {
        if (isMaxSelected) {
            closeSuggestions();
            clearValue();
        }
    }, [selecteds, max]);

    const ghostIndex = useMemo(
        () => (!isFocused || isMaxSelected ? -1 : getGhostIndex(items, selecteds, getId, activeY)),
        [items, selecteds, getId, activeY, max]
    );

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

    // Reset activeX & close suggestion if clicking outside
    const onClickOutside = useCallback(
        (event: MouseEvent) => {
            if (resultListRef.current && !resultListRef.current.contains(event.target as Node)) {
                // Also clicking outside of result list
                closeSuggestions();
            }

            xNav.reset();
        },
        [resultListRef]
    );
    useClickOutside(ownRef, onClickOutside);

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
        [selecteds.length, xNav.isMovingCursor, activeX, activeY, items]
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
        onBlur: handleBlur,
        isDisabled: isDisabled || isMaxSelected,
    };

    const bindResultItem = useCallback(
        (item: any, ActionBtn?: ReactElement) => ({
            key: getId(item),
            colorMode,
            isDisabled: selection.has(item),
            onClick: toggleSelectedEventHandler(item),
            color: COMMON_COLORS.color[colorMode],
            _selected: { backgroundColor: COMMON_COLORS.selected[colorMode] },
            renderResult: displayFn(item),
            actionBtn:
                ActionBtn &&
                cloneElement(ActionBtn, {
                    isChecked: selection.has(item),
                    onClick: toggleSelectedEventHandler(item),
                    onChange: () => {},
                }),
        }),
        [items, selecteds, colorMode]
    );

    const bindSelectedItem = useCallback(
        (tag, i) => ({
            key: i,
            label: displayFn(tag),
            isCurrent: i === activeX,
            isDisabled: isDisabled || isMaxSelected,
            onClick: selectItem(i),
            onCloseClick: onCloseClick(i),
        }),
        [selecteds, activeX]
    );

    // Computeds
    const totalResults = getTotalResults(total);
    const shouldDisplayList = !async.isLoading && (value.length > 0 || items.length > 0);
    const shouldHideLeftEl = shouldHideLeftElementOnFocus && (isFocused || value || selecteds.length);

    // Ghost will only be visible if there are results
    const shouldDisplayGhost = withGhostSuggestion && items.length && value && items[ghostIndex];

    const returnValues = {
        value,
        totalResults,
        selecteds,
        selection,
        ghostIndex,
        timer,
        isOpen,
        closeSuggestions,
        shouldDisplayList,
        shouldHideLeftEl,
        shouldDisplayGhost,
    };
    const refs = { self: bindSelf, input: bindInput, resultItem: bindResultItem, selectedItem: bindSelectedItem };
    return [returnValues, refs];
}

const getGhostIndex = (items: any[], selecteds: any[], getId: AutocompleteProps["getId"], activeY: number): number => {
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
export type UseAutocompleteProps<T = any> = Pick<
    AutocompleteProps<T, any>,
    | "onSelectionChange"
    | "async"
    | "reset"
    | "suggestionFn"
    | "displayFn"
    | "getId"
    | "createFn"
    | "shouldShowResultsOnFocus"
    | "shouldHideLeftElementOnFocus"
    | "withGhostSuggestion"
    | "max"
    | "delay"
    | "isDisabled"
>;

export type UseAutocompleteReturnValues<T = any> = {
    value: string;
    totalResults: string | number;
    selecteds: T[];
    selection: SelectionActions<T>;
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
        onBlur: () => void;
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
