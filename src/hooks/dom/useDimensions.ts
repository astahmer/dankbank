import { MutableRefObject, useRef, useState } from "react";

import { useEnhancedEffect } from "@/functions/utils";

export function useDimensions(): [MutableRefObject<HTMLElement>, Dimensions] {
    const ref = useRef();
    const [dimensions, setDimensions] = useState(null);
    useEnhancedEffect(() => {
        if (ref.current) {
            const measure = () => window.requestAnimationFrame(() => setDimensions(getDimensionObject(ref.current)));
            measure();
        }
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
    x: 0,
    y: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
};

function getDimensionObject(node: HTMLElement): Dimensions {
    const rect = node.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
        top: "x" in rect ? rect.x : rect.top,
        left: "y" in rect ? rect.y : rect.left,
        x: "x" in rect ? rect.x : rect.left,
        y: "y" in rect ? rect.y : rect.top,
        right: rect.right,
        bottom: rect.bottom,
    };
}