import { MutableRefObject, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

import { useEnhancedEffect } from "@/functions/utils";

import { Dimensions, initialDimensions } from "./useDimensions";

export function useMeasure(ref: MutableRefObject<HTMLElement>) {
    const [rect, set] = useState<Dimensions | ClientRect>(initialDimensions);
    const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)));

    useEnhancedEffect(() => {
        if (ref.current) {
            ro.observe(ref.current);
        }
        return () => ro.disconnect();
    }, [ref.current]);

    return rect;
}
