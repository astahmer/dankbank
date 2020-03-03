import { useDimensions } from "@/hooks/dom";

import { Swipable } from "./";
import { SwipableProps } from "./Swipable";

export type MovableListProps = ChildrenProp & SwipableProps;

export function MovableList({ children, ...props }: MovableListProps) {
    const [swipeRef, setRef, { width: swipeWidth }] = useDimensions();
    const [parentRef, setParentRef, { width: parentWidth }] = useDimensions();
    const dragOptions = { bounds: { left: swipeWidth > parentWidth ? parentWidth - swipeWidth : 0, right: 0 } };

    return (
        <div ref={setParentRef}>
            <Swipable
                axis={"X"}
                display="flex"
                w="max-content"
                dragOptions={dragOptions}
                isFreeMode
                {...props}
                ref={setRef}
            >
                {children}
            </Swipable>
        </div>
    );
}
