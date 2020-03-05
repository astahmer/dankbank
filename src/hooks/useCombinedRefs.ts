import { MutableRefObject, Ref, useCallback, useEffect, useRef } from "react";

export function useCombinedRefs<T = any>(...refs: Array<Ref<T> | MutableRefObject<T>>) {
    const targetRef = useRef<T>();

    useEffect(() => {
        refs.forEach((ref) => {
            if (!ref) return;

            if (typeof ref === "function") {
                ref(targetRef.current);
            } else {
                (ref as MutableRefObject<T>).current = targetRef.current;
            }
        });
    }, [refs]);

    return targetRef;
}

export const useCombinedRefsCallback = <T extends any>(
    ...refs: Array<Ref<T> | MutableRefObject<T>>
): ((element: T) => void) =>
    useCallback(
        (element: T) =>
            refs.forEach((ref) => {
                if (!ref) {
                    return;
                }

                // Ref can have two types - a function or an object. We treat each case.
                if (typeof ref === "function") {
                    return ref(element);
                }

                // As per https://github.com/facebook/react/issues/13029
                // it should be fine to set current this way.
                (ref as any).current = element;
            }),
        refs
    );
