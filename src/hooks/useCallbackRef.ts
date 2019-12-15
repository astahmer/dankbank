import { useCallback, useState } from "react";

export type UseCallbackRefProps = { trigger?: any };

export function useCallbackRef<T = HTMLElement>(props?: UseCallbackRefProps) {
    const trigger = props && props.trigger;
    const [ref, setRef] = useState({ current: null });

    // Using a callback ref to update it whenever trigger changes
    const getRef = useCallback((element: T) => setRef({ current: element }), [trigger]);

    return [ref, getRef] as const;
}
