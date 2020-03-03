import { Box, BoxProps } from "@chakra-ui/core";
import React, { ElementType, forwardRef, useEffect, useMemo, useState } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import { UseDragConfig, Vector2 } from "react-use-gesture/dist/types";

// Original https://codesandbox.io/s/crimson-dawn-pzf9t

export const Swipable = forwardRef<HTMLElement, SwipableProps>(
    (
        {
            axis = "BOTH",
            swipeDistance = 60,
            swipeVelocity = 0.5,
            xDistance = 1,
            yDistance = 1,
            as: Component = Box,
            isDraggable = true,
            currentPos: currentPosProp,
            isDisabled,
            isFreeMode,
            dragOptions,
            ...props
        },
        ref
    ) => {
        const AnimatedComponent = useMemo(() => animated(Component), []);
        const [localPos, setPos] = useState<SwipePosition>({ x: 0, y: 0 });
        const currentPos = currentPosProp ? reversePos(currentPosProp) : localPos;
        const [{ x, y }, setXY] = useSpring(() => ({ x: xDistance * currentPos.x, y: yDistance * currentPos.y }));

        // On controlled currentPos change, set spring
        useEffect(() => {
            if (currentPosProp) {
                const reversed = reversePos(currentPosProp);
                setXY({ x: xDistance * reversed.x, y: yDistance * reversed.y });
            }
        }, [currentPosProp]);

        const { boundaries: propsBoundaries, onSwipe, ...rest } = props;
        const boundaries = useMemo(() => getBoundaries(propsBoundaries), [propsBoundaries]);

        const bind = useDrag(
            ({ last, direction: dirV, vxvy, movement: [movX, movY], offset: [offX, offY] }) => {
                if (isDisabled) {
                    setXY({
                        x: canMoveAxisX(axis) ? xDistance * currentPos.x : 0,
                        y: canMoveAxisY(axis) ? yDistance * currentPos.y : 0,
                    });
                    return;
                }

                if (isDraggable || last) {
                    const direction = getDirection(vxvy, dirV);

                    // Swipe is done
                    if (last && !isFreeMode) {
                        const isValid = isSwipeValid(direction, [movX, movY], swipeDistance, vxvy, swipeVelocity);

                        // Swipe distance or velocity was not reached, returning to previous position
                        if (!isValid) {
                            setXY({
                                x: canMoveAxisX(axis) ? xDistance * currentPos.x : 0,
                                y: canMoveAxisY(axis) ? yDistance * currentPos.y : 0,
                            });
                            return;
                        }

                        // Swipe valid, updating position & calling props callback
                        const updatedPos = getUpdatedPosition(currentPos, direction, boundaries);

                        // If swipe is uncontrolled, update local state
                        if (!currentPosProp) {
                            setPos(updatedPos);
                        }

                        setXY({
                            x: canMoveAxisX(axis) ? xDistance * updatedPos.x : 0,
                            y: canMoveAxisY(axis) ? yDistance * updatedPos.y : 0,
                        });
                        props.onSwipe?.(direction, reversePos(updatedPos));
                    } else {
                        // Dragging
                        setXY({
                            x: canMoveAxisX(axis) ? (isFreeMode ? offX : movX) + xDistance * currentPos.x : 0,
                            y: canMoveAxisY(axis) ? (isFreeMode ? offY : movY) + yDistance * currentPos.y : 0,
                        });
                    }
                }
            },
            {
                axis: axis !== "BOTH" ? (axis.toLowerCase() as "x" | "y") : undefined,
                threshold: 15,
                lockDirection: true,
                rubberband: isFreeMode,
                ...dragOptions,
            }
        );

        return (
            <AnimatedComponent
                {...rest}
                {...bind()}
                pointerEvents={isDisabled && "none"}
                style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}
                ref={ref}
                forwardedRef={ref}
            />
        );
    }
);
Swipable.displayName = "Swipable";

export type SwipableProps<ElementProps = BoxProps> = ElementProps & {
    axis?: SwipeAxis;
    swipeDistance?: number;
    swipeVelocity?: number;
    xDistance?: number;
    yDistance?: number;
    as?: ElementType;
    isDraggable?: boolean;
    currentPos?: SwipePosition;
    boundaries?: SwipeBoundaries;
    isDisabled?: boolean;
    isFreeMode?: boolean;
    onSwipe?: (direction: SwipeDirection, updatedPos: SwipePosition) => void;
    dragOptions?: UseDragConfig;
};

export type SwipeAxis = "X" | "Y" | "BOTH";
export type SwipeDirection = "LEFT" | "RIGHT" | "UP" | "DOWN";
export type SwipePosition = { x: number; y: number };
export type SwipeBoundaries = { x: [number, number]; y: [number, number] };

const isSwipeAxisX = (direction: SwipeDirection) => ["LEFT", "RIGHT"].includes(direction);
const canMoveAxisX = (axis: SwipeAxis) => axis !== "Y";
const canMoveAxisY = (axis: SwipeAxis) => axis !== "X";

const reverseValue = (value: number) => value * -1;
const reversePos = (pos: SwipePosition) => ({ x: reverseValue(pos.x), y: reverseValue(pos.y) });
const getBoundaries = (boundaries: SwipeBoundaries) =>
    boundaries &&
    ({
        x: boundaries.x.map(reverseValue),
        y: boundaries.y.map(reverseValue),
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
