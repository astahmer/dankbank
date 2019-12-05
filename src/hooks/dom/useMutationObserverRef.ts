import { MutableRefObject, useRef } from "react";

import { useEnhancedEffect } from "@/functions/utils";

type Callback = (entry: MutationRecord[]) => void;

export function useMutationObserverRef<T extends HTMLElement>(
    ref: MutableRefObject<T>,
    config?: MutationObserverInit,
    callback?: Callback
) {
    const observer = useRef(process.browser && new MutationObserver((entries) => callback(entries)));

    useEnhancedEffect(() => {
        if (ref.current) {
            observer.current.observe(ref.current, config || defaultConfig);
        }
        return () => observer.current.disconnect();
    }, []);

    return observer.current;
}

const defaultConfig: MutationObserverInit = {
    attributes: false,
    characterData: false,
    childList: true,
    subtree: false,
    attributeOldValue: false,
    characterDataOldValue: false,
};
