import { Box, BoxProps } from "@chakra-ui/core";
import React, { useState } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

// Original https://codesandbox.io/s/crimson-dawn-pzf9t

export type SwipableProps = BoxProps & {
    axis?: SwipeAxis;
    threshold?: number;
    xDistance?: number;
    yDistance?: number;
    onSwipe?: (direction: SwipeDirection, distance: number) => void;
};

export function Swipable({
    axis = SwipeAxis.BOTH,
    threshold = 0.3,
    xDistance = 1,
    yDistance = 1,
    onSwipe,
    ...props
}: SwipableProps) {
    const [xPos, setXPos] = useState(0);
    const [yPos, setYPos] = useState(0);
    const { x, y } = useSpring({ x: xPos * xDistance, y: yPos * yDistance });
    const bind = useDrag(({ last, vxvy: [vx, vy] }) => {
        if (last) {
            let direction;
            if (axis !== SwipeAxis.Y && Math.abs(vx) > Math.abs(vy)) {
                if (vx < -threshold && xPos > -1) {
                    setXPos((xp) => xp - 1);
                    direction = SwipeDirection.LEFT;
                }
                // swipe right is when horizontal velocity is superior to threshold
                else if (vx > threshold && xPos < 1) {
                    setXPos((xp) => xp + 1);
                    direction = SwipeDirection.RIGHT;
                }
            } else {
                // swipe up is when vertical velocity is inferior to minus threshold
                if (vy < -threshold && yPos > -1) {
                    setYPos((yp) => yp - 1);
                    direction = SwipeDirection.UP;
                }
                // swipe down is when vertical velocity is superior to threshold
                else if (vy > threshold && yPos < 1) {
                    setYPos((yp) => yp + 1);
                    direction = SwipeDirection.DOWN;
                }
            }
            onSwipe && onSwipe(direction, isSwipeAxisX(direction) ? xDistance : yDistance);
        }
    });
    return (
        <AnimatedBox
            {...props}
            {...bind()}
            style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}
        />
    );
}

export enum SwipeAxis {
    X,
    Y,
    BOTH,
}
export enum SwipeDirection {
    LEFT,
    RIGHT,
    UP,
    DOWN,
}

const AnimatedBox = animated(Box);
const isSwipeAxisX = (direction: SwipeDirection) => [SwipeDirection.LEFT, SwipeDirection.RIGHT].includes(direction);
