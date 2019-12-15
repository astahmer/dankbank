import { MutableRefObject, Ref, useEffect, useRef } from "react";

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
