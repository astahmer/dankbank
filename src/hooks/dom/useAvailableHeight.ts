import { MutableRefObject, useEffect, useRef, useState } from "react";

import { getInnerDimensions } from "@/functions/utils";

import { useMeasure } from "./";

/** Get available height of an element by substracting its sibling heights to its parent height  */
export function useAvailableHeight(elementRef: MutableRefObject<HTMLElement>) {
    const [availableHeight, setAvailableHeight] = useState(0);
    const parentRef = useRef<HTMLElement>();

    const rect = useMeasure(parentRef);

    useEffect(() => {
        if (elementRef.current) {
            const [available, heights] = getAvailableHeight(elementRef.current);
            parentRef.current = heights.currentElement;
            setAvailableHeight(available);
        }
    }, [elementRef.current, rect]);

    return availableHeight;
}

export const getAvailableHeight = (element: HTMLElement) => {
    let currentElement = element;
    let heights = getHeights(currentElement);

    while (heights.currentHeight === heights.parentHeight || heights.currentHeight === heights.siblingsHeight) {
        currentElement = currentElement.parentElement;
        heights = getHeights(currentElement);
    }

    return [heights.parentHeight - heights.siblingsHeight, heights] as const;
};

const getInnerHeight = (element: HTMLElement) => (element ? getInnerDimensions(element).height : 0);

const getHeights = (element: HTMLElement) => {
    const currentElement = element;
    const currentHeight = getInnerHeight(element);

    const currentParent = currentElement.parentElement;
    const parentHeight = getInnerHeight(currentParent);

    const siblingsHeight = Array.from(currentParent.children).reduce(
        (acc, item) => acc + (item !== element ? getInnerHeight(item as HTMLElement) : 0),
        0
    );
    const availableHeight = parentHeight - siblingsHeight;

    return { currentElement, currentHeight, currentParent, parentHeight, siblingsHeight, availableHeight };
};
