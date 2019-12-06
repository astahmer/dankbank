import { useCallback, useState } from "react";

export type UseCallbackRefProps = { trigger?: any };

// TODo rename useCallbackRef
export function useCallbackRef(props?: UseCallbackRefProps) {
    const trigger = props && props.trigger;
    const [ref, setRef] = useState({ current: null });

    // Using a callback ref to update it whenever trigger changes
    const getRef = useCallback((element: HTMLElement) => setRef({ current: element }), [trigger]);

    return [ref, getRef] as const;
}
