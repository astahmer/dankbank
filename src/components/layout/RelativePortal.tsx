import { Box, BoxProps, Portal, PortalProps } from "@chakra-ui/core";
import { cloneElement, ReactElement, useCallback, useEffect, useRef } from "react";

import { setRef, throttle } from "@/functions/utils";

// Inspired of https://github.com/sunify/react-relative-portal

export function RelativePortal({
    element,
    children,
    isFullWidth,
    offset,
    boxProps,
    ...portalProps
}: RelativePortalProps) {
    const elementRef = useRef<HTMLElement>();
    const getElementRef = useCallback((node) => {
        setRef(elementRef, node);
    }, []);

    const wrapperRef = useRef<HTMLElement>();
    const getWrapperRef = useCallback((node) => {
        setRef(wrapperRef, node);
        handleScroll();
    }, []);
    const posRef = useRef<Offset>({ left: 0, top: 0, right: 0 });

    const handleScroll = useCallback(() => {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            const pageOffset = getPageOffset();

            const top = pageOffset.y + rect.top;
            const right = document.documentElement.clientWidth - rect.right - pageOffset.x;
            const left = pageOffset.x + rect.left;

            if (top !== posRef.current.top || left !== posRef.current.left || right !== posRef.current.right) {
                if (wrapperRef.current) {
                    const fromLeftOrRight: Offset = left !== undefined ? { left } : { right };
                    const horizontalPosition = isFullWidth ? { right, left } : fromLeftOrRight;

                    posRef.current = { top, ...horizontalPosition };

                    if (posRef.current.top !== undefined) {
                        wrapperRef.current.style.top = posRef.current.top + (offset?.top || 0) + "px";
                    }
                    if (posRef.current.left !== undefined) {
                        wrapperRef.current.style.left = posRef.current.left + (offset?.left || 0) + "px";
                    }
                    if (posRef.current.right !== undefined) {
                        wrapperRef.current.style.right = posRef.current.right + (offset?.right || 0) + "px";
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        const eventHandler = throttle(fireListeners, 100);
        window.addEventListener("scroll", eventHandler);
        window.addEventListener("resize", eventHandler);

        const unsubscribe = subscribe(handleScroll);

        return () => {
            window.removeEventListener("scroll", eventHandler);
            window.removeEventListener("resize", eventHandler);
            unsubscribe();
        };
    }, []);

    return (
        <>
            {cloneElement(element, { ref: getElementRef, ...element.props })}
            <Portal {...portalProps}>
                <Box pos="absolute" {...boxProps} ref={getWrapperRef}>
                    {children}
                </Box>
            </Portal>
        </>
    );
}

type Offset = { left?: number; top?: number; right?: number };
type RelativePortalProps = PortalProps & {
    element: ReactElement;
    isFullWidth?: boolean;
    offset?: Offset;
    boxProps?: BoxProps;
};

type Listeners = Record<string, Function>;
const listeners: Listeners = {};

function fireListeners() {
    Object.keys(listeners).forEach((key) => listeners[key]());
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

let listenerIdCounter = 0;
function subscribe(fn: Function) {
    listenerIdCounter += 1;
    const id = listenerIdCounter;
    listeners[id] = fn;
    return () => delete listeners[id];
}
