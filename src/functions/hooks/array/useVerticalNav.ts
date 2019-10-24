import { usePrevious } from "@chakra-ui/core";
import { KeyboardEventHandler, MutableRefObject, useEffect, useRef } from "react";

import { useArrayCursor } from "./useArrayCursor";

const setTabIndex = (tabIndex: number) => (node: HTMLElement) => node.setAttribute("tabindex", tabIndex + "");

export type useVerticalNavProps = {
    hasList: boolean;
    containerRef: MutableRefObject<any>;
    activableSelector: string;
    onEscapeKeyDown?: KeyboardEventHandler;
    onKeyDownWithoutList?: KeyboardEventHandler;
    onEnterKeyDown?: (activeIndex: number) => void;
};

export type VerticalNavControl = {
    activeItem: HTMLElement;
    resetActive: () => void;
    initActivableItems: () => void;
    onKeyDown: KeyboardEventHandler;
};
export type VerticalNav = [number, VerticalNavControl];

export function useVerticalNav({
    hasList,
    containerRef,
    activableSelector,
    onEscapeKeyDown,
    onEnterKeyDown,
    onKeyDownWithoutList,
}: useVerticalNavProps): VerticalNav {
    const activableItems = useRef<HTMLElement[]>(null);
    const initActivableItems = () => {
        if (hasList && containerRef && containerRef.current) {
            activableItems.current = Array.from(containerRef.current.querySelectorAll(activableSelector));
            activableItems.current.forEach(setTabIndex(0));
        } else {
            activableItems.current = [];
        }
    };

    const [activeIndex, cursorActions] = useArrayCursor(activableItems.current && activableItems.current.length);
    const prevActiveIndex = usePrevious(activeIndex);

    const resetActive = () => {
        if (prevActiveIndex > -1 && activableItems.current[prevActiveIndex]) {
            activableItems.current[prevActiveIndex].setAttribute("aria-selected", "false");
        }
        cursorActions.reset();
    };

    const handleActiveIndexChange = () => {
        // When an element is active
        if (activeIndex !== -1 && activableItems.current[activeIndex]) {
            activableItems.current[activeIndex].setAttribute("aria-selected", "true");
            activableItems.current[activeIndex].scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
            });

            // Unselect previous
            if (prevActiveIndex > -1 && activableItems.current[prevActiveIndex]) {
                activableItems.current[prevActiveIndex].setAttribute("aria-selected", "false");
            }
        }
    };

    // When list is shown, init activableItems & their tabIndex
    useEffect(initActivableItems, [hasList]);

    // Update index & change/reset active item
    useEffect(handleActiveIndexChange, [activeIndex]);

    const onKeyDown: KeyboardEventHandler = (event) => {
        // When there is no items
        if (!activableItems || !activableItems.current.length) {
            if (onKeyDownWithoutList) {
                onKeyDownWithoutList(event);
            }
            return;
        }

        // Event requiring items
        if (event.key === "ArrowDown") {
            event.preventDefault();
            cursorActions.next();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            cursorActions.prev();
        } else if (event.key === "Tab") {
            event.preventDefault();
        } else if (event.key === "Escape" && onEscapeKeyDown) {
            onEscapeKeyDown(event);
        } else if (event.key === "Enter" && onEnterKeyDown && activeIndex !== -1) {
            onEnterKeyDown(activeIndex);
        }
    };

    const activeItem = activableItems && activableItems.current && activableItems.current[activeIndex];
    return [activeIndex, { activeItem, resetActive, initActivableItems, onKeyDown }];
}
