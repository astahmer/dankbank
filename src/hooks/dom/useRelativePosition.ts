import { MutableRefObject, useCallback, useEffect, useRef } from "react";

import { off, on, setRef, throttle } from "@/functions/utils";

const defaultEvents = ["scroll", "resize"];

export function useRelativePosition(
    elementRef: MutableRefObject<HTMLElement>,
    options?: UseRelativePositionOptions
): UseRelativePositionReturn {
    const { placement, offset, isFullWidth, onChange, events = defaultEvents } = options || {};

    const wrapperRef = useRef<HTMLElement>();
    const getWrapperRef = useCallback((element: HTMLElement) => {
        setRef(wrapperRef, element);
        handleScroll();
    }, []);
    const posRef = useRef<Offset>({ left: 0, top: 0, right: 0 });

    const handleScroll = useCallback(() => {
        if (!(elementRef.current && wrapperRef.current)) {
            return;
        }
        const rect = elementRef.current.getBoundingClientRect();
        const pageOffset = getPageOffset();

        const top = pageOffset.y + rect.top;
        const right = document.documentElement.clientWidth - rect.right - pageOffset.x;
        const left = pageOffset.x + rect.left;

        if (top !== posRef.current.top || left !== posRef.current.left || right !== posRef.current.right) {
            const fromLeftOrRight: Offset = left !== undefined ? { left } : { right };
            const horizontalPosition = isFullWidth ? { right, left } : fromLeftOrRight;

            posRef.current = { top, ...horizontalPosition };
            onChange?.(posRef.current);

            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const [anchorOffsetX, anchorOffsetY] = getAnchorOffsetByPlacement(placement, rect, wrapperRect);

            if (posRef.current.top !== undefined) {
                wrapperRef.current.style.top = posRef.current.top + (anchorOffsetY || 0) + (offset?.top || 0) + "px";
            }
            if (posRef.current.left !== undefined) {
                wrapperRef.current.style.left = posRef.current.left + (anchorOffsetX || 0) + (offset?.left || 0) + "px";
            }
            if (posRef.current.right !== undefined) {
                wrapperRef.current.style.right = posRef.current.right + (offset?.right || 0) + "px";
            }
        }
    }, [elementRef]);

    useEffect(() => {
        const handler = throttle(handleScroll, 100);

        for (const eventName of events) {
            on(document, eventName, handler);
        }

        return () => {
            for (const eventName of events) {
                off(document, eventName, handler);
            }
        };
    }, []);

    return [getWrapperRef, wrapperRef, handleScroll];
}

export type Offset = { left?: number; top?: number; right?: number };
export type PlacementX = "left" | "center" | "right";
export type PlacementY = "top" | "center" | "bottom";
export type Placement = [PlacementX, PlacementY];

export type UseRelativePositionOptions = {
    isFullWidth?: boolean;
    placement?: Placement;
    offset?: Offset;
    events?: string[];
    onChange?: (pos: Offset) => void;
};

type Ref = MutableRefObject<HTMLElement>;
type RefSetter = (node: HTMLElement) => void;
export type UseRelativePositionReturn = [RefSetter, Ref, Function];

function getAnchorOffsetByPlacement(placement: Placement, elementRect: DOMRect, wrapperRect: DOMRect) {
    if (!placement) {
        return [0, 0];
    }

    let [offsetX, offsetY] = [0, 0];
    const [pX, pY] = placement;

    if (pX === "left") {
        offsetX = -elementRect.width;
    } else if (pX === "center" && wrapperRect.width) {
        offsetX = +elementRect.width / 2 - wrapperRect.width / 2;
    } else if (pX === "right") {
        offsetX = +elementRect.width;
    }

    if (pY === "top") {
        offsetY = -elementRect.height;
    } else if (pY === "center" && wrapperRect.height) {
        offsetY = -elementRect.height / 2 + wrapperRect.height / 2;
    } else if (pY === "bottom") {
        offsetY = +elementRect.height;
    }

    console.log(placement, [offsetX, offsetY], elementRect, wrapperRect);
    return [offsetX, offsetY];
}

function getPageOffset() {
    return {
        x:
            window.pageXOffset !== undefined
                ? window.pageXOffset
                : (document.documentElement || document.body.parentElement || document.body).scrollLeft,
        y:
            window.pageYOffset !== undefined
                ? window.pageYOffset
                : (document.documentElement || document.body.parentElement || document.body).scrollTop,
    };
}
