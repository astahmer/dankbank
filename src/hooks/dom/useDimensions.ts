import { MutableRefObject, useRef, useState } from "react";

import { useEnhancedEffect } from "@/functions/utils";

export function useDimensions(): [MutableRefObject<HTMLElement>, Dimensions] {
    const hasUnmounted = useRef(null);
    const ref = useRef<HTMLElement>();
    const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
    useEnhancedEffect(() => {
        if (ref.current) {
            const measure = () =>
                window.requestAnimationFrame(
                    () => !hasUnmounted.current && setDimensions(getDimensionObject(ref.current))
                );
            measure();
        }

        return () => (hasUnmounted.current = true);
    }, []);

    return [ref, dimensions];
}

export type Dimensions = {
    width: number;
    height: number;
    top: number;
    left: number;
    x: number;
    y: number;
    right: number;
    bottom: number;
};

export const initialDimensions = {
    x: null,
    y: null,
    top: null,
    right: null,
    bottom: null,
    left: null,
    width: null,
    height: null,
} as any;

function getDimensionObject(node: HTMLElement): Dimensions {
    if (!node) return;
    const rect = node.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        x: rect.left,
        y: rect.top,
        right: rect.right,
        bottom: rect.bottom,
    };
}
