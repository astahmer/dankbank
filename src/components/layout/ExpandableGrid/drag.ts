import { OpaqueInterpolation } from "react-spring";
import { CommonGestureState, Coordinates, Vector2 } from "react-use-gesture/dist/types";

import {
    clampedRangeMap, findNearestNumberInArray, projection, rangeMap, rubberBandIfOutOfBounds
} from "@/functions/spring-utils";

export const dragSelected = ({
    onImageDismiss,
    x,
    y,
    set,
    setBackgroundSpring,
    width,
}: {
    onImageDismiss: Function;
    x: VelocityTrackedAnimatedValue;
    y: VelocityTrackedAnimatedValue;
    set: (args: any) => void;
    setBackgroundSpring: Function;
    width: number;
}) => ({
    vxvy: [, velocityY],
    movement: [movementX, movementY],
    last,
    memo,
}: Pick<Coordinates, "vxvy"> & Pick<CommonGestureState, "movement" | "last" | "memo">) => {
    if (!memo) {
        const isIntentionalGesture = Math.abs(movementY) > threshold;
        if (!isIntentionalGesture) return;
        memo = { y: y.value - movementY, x: x.value - movementX };
    }

    if (last) {
        const projectedEndpoint = y.value + projection(velocityY, "fast");
        const point = findNearestNumberInArray(projectedEndpoint, yStops);

        if (point === yStops[1]) {
            return set({
                immediate: false,
                y: point,
                onFrame: () => {
                    if (Math.abs(y.lastVelocity) < 1000) {
                        onImageDismiss();
                        set({ onFrame: undefined });
                    }
                },
            });
        } else {
            setBackgroundSpring({ opacity: 1 });
            return set({
                immediate: false,
                y: 0,
                x: 0,
                scaleY: 1,
                scaleX: 1,
            });
        }
    }

    const newY = rubberBandIfOutOfBounds(yStops[0], yStops[1], movementY + memo.y);
    const newX = rubberBandIfOutOfBounds(xStops[0], xStops[1], movementX + memo.x);

    // allow for interruption of enter animation
    memo.immediate = memo.immediate || Math.abs(newY - y.value) < 1;

    const scale = clampedRangeMap(yStops, scaleStops, movementY + memo.y);

    set({
        y: newY,
        x: newX + ((1 - scale) / 2) * width,
        scaleY: scale,
        scaleX: scale,
        onFrame: null,
        immediate: memo.immediate,
    });

    setBackgroundSpring({ opacity: rangeMap(yStops, [1.5, 0.5], newY) });

    return memo;
};

export const dragUnselected = ({ doSelect }: { doSelect: () => void }) => ({
    last,
    movement,
}: Pick<CommonGestureState, "last" | "movement">) => {
    if (last && Math.abs(movement[0]) + Math.abs(movement[1]) < 2) {
        doSelect();
    }
};

type VelocityTrackedAnimatedValue<T = number> = OpaqueInterpolation<T> & { value?: T; lastVelocity?: number };

const threshold = 10;
const yStops: Vector2 = [0, 150];
const xStops: Vector2 = [-20, 20];
const scaleStops: Vector2 = [1, 0.75];
