import { MutableRefObject, useRef, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

import { useEnhancedEffect } from "@/functions/utils";

import { Dimensions } from "./useDimensions";

export function useMeasure<T extends HTMLElement>(propRef?: MutableRefObject<T>, withPos = true) {
    const ref = useRef(propRef && propRef.current);
    const [bounds, set] = useState<Dimensions | ClientRect>();
    const [ro] = useState(
        () => new ResizeObserver(([entry]) => set(!withPos ? entry.contentRect : entry.target.getBoundingClientRect()))
    );

    useEnhancedEffect(() => {
        if (ref.current) {
            ro.observe(ref.current);
        }
        return () => ro.disconnect();
    }, []);

    return [ref, bounds] as const;
}
