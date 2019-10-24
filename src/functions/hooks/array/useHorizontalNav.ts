import { KeyboardEvent, MutableRefObject, useCallback, useState } from "react";

import { ArrayCursorActions, useArrayCursor } from "./useArrayCursor";

export type HorizontalNavControl = {
    isMovingCursor: boolean;
    reset: () => void;
    onKeyDown: (event: KeyboardEvent<Element>) => void;
    cursorActions: ArrayCursorActions;
};
export type HorizontalNav = [number, HorizontalNavControl];

export function useHorizontalNav(selectedLength: number, inputRef: MutableRefObject<any>): HorizontalNav {
    // Active selected item to remove
    const [isMovingCursor, setIsMovingCursor] = useState(false);
    const [activeIndex, cursorActions] = useArrayCursor(
        selectedLength,
        isMovingCursor ? selectedLength - 1 : -1,
        false
    );
    const reset = useCallback(() => {
        setIsMovingCursor(false);
        cursorActions.reset();
    }, []);

    // Called when KeyDown is triggered while suggestions list is closed
    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (selectedLength) {
                if (event.key === "ArrowLeft" && inputRef.current.selectionStart === 0) {
                    event.preventDefault();
                    if (isMovingCursor) {
                        cursorActions.prev();
                    } else {
                        setIsMovingCursor(true);
                    }
                } else if (event.key === "ArrowRight" && inputRef.current.selectionStart === 0) {
                    if (activeIndex === selectedLength - 1 || activeIndex === -1) {
                        setIsMovingCursor(false);
                    } else {
                        event.preventDefault();
                        cursorActions.next();
                    }
                }
            }
        },
        [selectedLength, isMovingCursor, activeIndex]
    );

    return [
        activeIndex,
        {
            isMovingCursor,
            reset,
            onKeyDown,
            cursorActions,
        },
    ];
}
