import { Box, BoxProps } from "@chakra-ui/core";
import React, { forwardRef, useMemo, useState } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import { Vector2 } from "react-use-gesture/dist/types";

// Original https://codesandbox.io/s/crimson-dawn-pzf9t

export const Swipable = forwardRef<HTMLElement, SwipableProps>(
    (
        {
            axis = "BOTH",
            swipeDistance = 60,
            swipeVelocity = 0.5,
            xDistance = 1,
            yDistance = 1,
            AnimatedComponent = AnimatedBox,
            isDraggable = true,
            ...props
        },
        ref
    ) => {
        const [pos, setPos] = useState<SwipePosition>({ x: 0, y: 0 });
        const [{ x, y }, set] = useSpring(() => pos);

        const { boundaries: propsBoundaries, onSwipe, ...rest } = props;
        const boundaries = useMemo(() => getBoundaries(propsBoundaries), [propsBoundaries]);

        const bind = useDrag(({ last, direction: dirV, vxvy, movement: [movX, movY] }) => {
            if (isDraggable || last) {
                const direction = getDirection(vxvy, dirV);

                // Swipe is done
                if (last) {
                    const isValid = isSwipeValid(direction, [movX, movY], swipeDistance, vxvy, swipeVelocity);

                    // Swipe distance or velocity was not reached, returning to previous position
                    if (!isValid) {
                        set({
                            x: canMoveAxisX(axis) ? xDistance * pos.x : 0,
                            y: canMoveAxisY(axis) ? yDistance * pos.y : 0,
                        });
                        return;
                    }

                    // Swipe valid, updating position & calling props callback
                    const updatedPos = getUpdatedPosition(pos, direction, boundaries);
                    setPos(updatedPos);
                    set({
                        x: canMoveAxisX(axis) ? xDistance * updatedPos.x : 0,
                        y: canMoveAxisY(axis) ? yDistance * updatedPos.y : 0,
                    });
                    props.onSwipe?.(direction, { x: updatedPos.x * -1, y: updatedPos.y * -1 });
                } else {
                    // Dragging
                    set({
                        x: canMoveAxisX(axis) ? movX + xDistance * pos.x : 0,
                        y: canMoveAxisY(axis) ? movY + yDistance * pos.y : 0,
                    });
                }
            }
        });

        return (
            <AnimatedComponent
                {...rest}
                {...bind()}
                style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}
                ref={ref}
            />
        );
    }
);
Swipable.displayName = "Swipable";

export type SwipableProps = BoxProps & {
    axis?: SwipeAxis;
    swipeDistance?: number;
    swipeVelocity?: number;
    xDistance?: number;
    yDistance?: number;
    AnimatedComponent?: React.ForwardRefExoticComponent<React.PropsWithChildren<any>>;
    isDraggable?: boolean;
    boundaries?: SwipeBoundaries;
    onSwipe?: (direction: SwipeDirection, updatedPos: SwipePosition) => void;
};

export type SwipeAxis = "X" | "Y" | "BOTH";
export type SwipeDirection = "LEFT" | "RIGHT" | "UP" | "DOWN";
export type SwipePosition = { x: number; y: number };
export type SwipeBoundaries = { x: [number, number]; y: [number, number] };

const AnimatedBox = animated(Box);
const isSwipeAxisX = (direction: SwipeDirection) => ["LEFT", "RIGHT"].includes(direction);
const canMoveAxisX = (axis: SwipeAxis) => axis !== "Y";
const canMoveAxisY = (axis: SwipeAxis) => axis !== "X";

const reversePos = (pos: number) => pos * -1;
const getBoundaries = (boundaries: SwipeBoundaries) =>
    boundaries &&
    ({
        x: boundaries.x.map(reversePos),
        y: boundaries.y.map(reversePos),
    } as SwipeBoundaries);

const getDirection = ([vx, vy]: Vector2, [dirX, dirY]: Vector2) => {
    if (Math.abs(vx) > Math.abs(vy)) {
        return dirX < 0 ? "LEFT" : "RIGHT";
    } else {
        return dirY < 0 ? "UP" : "DOWN";
    }
};

const isSwipeValid = (
    direction: SwipeDirection,
    [movX, movY]: Vector2,
    swipeDistance: number,
    [vx, vy]: Vector2,
    swipeVelocity: number
) => {
    const wasSwipeAxisX = isSwipeAxisX(direction);
    const isDistanceReached =
        (wasSwipeAxisX && Math.abs(movX) >= swipeDistance) || (!wasSwipeAxisX && Math.abs(movY) >= swipeDistance);
    const isVelocityReached = (wasSwipeAxisX && vx >= swipeVelocity) || (!wasSwipeAxisX && vy >= swipeVelocity);

    return isDistanceReached || isVelocityReached;
};

const updateByDirection: Record<
    SwipeDirection,
    (position: SwipePosition, boundaries: SwipeBoundaries) => SwipePosition
> = {
    LEFT: (position, boundaries) =>
        !boundaries || position.x > boundaries.x[1] ? { x: position.x - 1, y: position.y } : position,
    RIGHT: (position, boundaries) =>
        !boundaries || position.x < boundaries.x[0] ? { x: position.x + 1, y: position.y } : position,
    UP: (position, boundaries) =>
        !boundaries || position.y > boundaries.y[1] ? { x: position.x, y: position.y - 1 } : position,
    DOWN: (position, boundaries) =>
        !boundaries || position.y < boundaries.y[0] ? { x: position.x, y: position.y + 1 } : position,
};
const getUpdatedPosition = (currentPos: SwipePosition, direction: SwipeDirection, boundaries: SwipeBoundaries) =>
    updateByDirection[direction](currentPos, boundaries);
