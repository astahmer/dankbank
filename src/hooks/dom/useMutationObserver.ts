import { MutableRefObject, useMemo, useState } from "react";

import { useEnhancedEffect } from "@/functions/utils";

export function useMutationObserver<T extends HTMLElement>(ref: MutableRefObject<T>, config?: MutationObserverInit) {
    const [mutations, set] = useState<MutationRecord[]>(null);
    const observer = useMemo(() => process.browser && new MutationObserver((entries) => set(entries)), []);

    useEnhancedEffect(() => {
        if (ref.current) {
            observer.observe(ref.current, config || defaultConfig);
        }
        return () => observer.disconnect();
    }, []);

    return mutations;
}

const defaultConfig: MutationObserverInit = {
    attributes: false,
    characterData: false,
    childList: true,
    subtree: false,
    attributeOldValue: false,
    characterDataOldValue: false,
};
