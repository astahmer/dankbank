import { MouseEvent, TouchEvent, useCallback, useRef } from "react";

export function useLongPress(callback: (e: MouseEvent | TouchEvent) => void, duration: number = 500) {
    const timeout = useRef(null);
    const startPos = useRef({ x: null, y: null });

    const onPressStart = useCallback(
        (event: MouseEvent | TouchEvent) => {
            event.persist();
            if ("touches" in event) {
                startPos.current = { x: event.touches[0].screenX, y: event.touches[0].screenY };
            }

            timeout.current = setTimeout(() => callback(event), duration);
        },
        [callback, duration]
    );

    const onMove = useCallback((event: MouseEvent | TouchEvent) => {
        let shouldCancel = false;
        if ("touches" in event) {
            const endPos = { x: event.touches[0].screenX, y: event.touches[0].screenY };
            shouldCancel = Math.abs(startPos.current.x - endPos.x) > 15 || Math.abs(startPos.current.y - endPos.y) > 15;
        } else {
            shouldCancel = Math.abs(event.movementX) > 15 || Math.abs(event.movementY) > 15;
        }

        shouldCancel && clearTimeout(timeout.current);
    }, []);

    const cancelTimeout = useCallback((event: MouseEvent | TouchEvent) => clearTimeout(timeout.current), []);

    return {
        onMouseDown: onPressStart,
        onTouchStart: onPressStart,

        onMouseMove: onMove,
        onTouchMove: onMove,

        onMouseUp: cancelTimeout,
        onTouchEnd: cancelTimeout,
    };
}
