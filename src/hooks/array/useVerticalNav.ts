import { usePrevious } from "@chakra-ui/core";
import { KeyboardEventHandler, MutableRefObject, useCallback, useEffect, useRef } from "react";

import { useArrayCursor } from "./useArrayCursor";

export type UseVerticalNavProps = {
    isOpen: boolean;
    containerRef: MutableRefObject<HTMLElement>;
    activableSelector: string;
    onEscapeKeyDown?: KeyboardEventHandler;
    onKeyDownWithoutList?: KeyboardEventHandler;
    onEnterKeyDown?: (activeIndex: number) => void;
};

export function useVerticalNav({
    isOpen,
    containerRef,
    activableSelector,
    onEscapeKeyDown,
    onEnterKeyDown,
    onKeyDownWithoutList,
}: UseVerticalNavProps) {
    const activableItems = useRef<HTMLElement[]>(null);
    const initActivableItems = useCallback(() => {
        if (isOpen && containerRef && containerRef.current) {
            activableItems.current = Array.from(containerRef.current.querySelectorAll(activableSelector));
            activableItems.current.forEach(setTabIndex(0));
        } else {
            activableItems.current = [];
        }
    }, [containerRef.current]);

    const [activeIndex, cursorActions] = useArrayCursor(activableItems.current && activableItems.current.length);
    const prevActiveIndex = usePrevious(activeIndex);

    const resetActive = () => {
        if (prevActiveIndex > -1 && activableItems.current[prevActiveIndex]) {
            activableItems.current[prevActiveIndex].setAttribute("aria-selected", "false");
        }
        cursorActions.reset();
    };

    // When list is shown, init activableItems & their tabIndex
    useEffect(initActivableItems, [isOpen, containerRef.current]);

    // Update index & change/reset active item
    useEffect(() => {
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
    }, [activeIndex]);

    const onKeyDown: KeyboardEventHandler = (event) => {
        if (event.key === "Escape" && onEscapeKeyDown) {
            return onEscapeKeyDown(event);
        } else if (event.key === "Enter" && onEnterKeyDown) {
            // Prevent form submission on enter
            event.preventDefault();
            return onEnterKeyDown(activeIndex);
        } else if (event.key === "Tab") {
            event.preventDefault();
        }

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
        }
    };

    const activeItem = activableItems && activableItems.current && activableItems.current[activeIndex];
    return [activeIndex, { activeItem, resetActive, initActivableItems, onKeyDown }] as const;
}

const setTabIndex = (tabIndex: number) => (node: HTMLElement) => node.setAttribute("tabindex", tabIndex + "");
