import { useCallback, useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const didUnmount = useRef(false);
    useEffect(() => {
        return () => {
            clearTimeout(timer.current);
            didUnmount.current = true;
        };
    }, []);
    const timer = useRef(null);

    const debounced = useCallback(
        (...args: any) => {
            const hasTimer = timer !== null;

            if (hasTimer) {
                // Reset/restart timer
                clearTimeout(timer.current);
            } else {
                // Immediate fn call if there is no timer yet
                callback(...args);
            }

            timer.current = setTimeout(() => {
                if (!didUnmount.current) {
                    timer.current = null;
                    // if we restarted timer previously, we can now call fn
                    // (else it has already been immediately called)
                    hasTimer && callback(...args);
                }
            }, delay);
        },
        [callback, delay]
    );

    return ([debounced, timer] as any) as [T, number];
}
