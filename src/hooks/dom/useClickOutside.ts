import { MouseEvent, MutableRefObject, useEffect, useRef } from "react";

import { off, on } from "@/functions/utils";

// Taken from https://github.com/streamich/react-use

const defaultEvents = ["mousedown", "touchstart"];

export const useClickOutside = (
    ref: MutableRefObject<any>,
    onClickAway: (event: MouseEvent) => void,
    events: string[] = defaultEvents
) => {
    const savedCallback = useRef(onClickAway);
    useEffect(() => {
        savedCallback.current = onClickAway;
    }, [onClickAway]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            ref.current && !ref.current.contains(event.target) && savedCallback.current(event);
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
