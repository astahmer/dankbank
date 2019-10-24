import { KeyboardEvent, MutableRefObject, useEffect, useRef } from "react";

import { off, on } from "../../utils";

// Taken from https://github.com/streamich/react-use

const defaultEvents = ["mousedown", "touchstart"];

export const useClickOutside = (
    ref: MutableRefObject<any>,
    onClickAway: (event: KeyboardEvent) => void,
    events: string[] = defaultEvents
) => {
    const savedCallback = useRef(onClickAway);
    useEffect(() => {
        savedCallback.current = onClickAway;
    }, [onClickAway]);
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const { current: el } = ref;
            el && !el.contains(event.target) && savedCallback.current(event);
        };
        for (const eventName of events) {
            on(document, eventName, handler);
        }
        return () => {
            for (const eventName of events) {
                off(document, eventName, handler);
            }
        };
    }, [events, ref]);
};
