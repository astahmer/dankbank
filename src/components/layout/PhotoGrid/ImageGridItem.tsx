import { Box } from "@chakra-ui/core";
import { useEffect, useRef } from "react";
import { animated, interpolate, OpaqueInterpolation, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import { CommonGestureState, Coordinates, Vector2 } from "react-use-gesture/dist/types";

import { CustomImage } from "@/components/common/CustomImage";
import css from "@emotion/css";
import styled from "@emotion/styled";

import { PhotoGridItem } from "./PhotoGrid";
import { useVelocityTrackedSpring } from "./useVelocityTrackedSpring";
import {
    clampedRangeMap, findNearestNumberInArray, projection, rangeMap, rubberBandIfOutOfBounds
} from "./utils";

export const ImageGridItem = function({
    setSelectedImage,
    unsetSelectedImage,
    img,
    id,
    setSpring,
    isSelected,
    setBackgroundSpring,
    zIndexQueue,
    height,
    width,
}: ImageGridItemProps) {
    const [{ y }, setY] = useVelocityTrackedSpring(() => ({ y: 0 }));
    const [{ x }, setX] = useSpring(() => ({ x: 0 }));
    const [{ scaleX, scaleY }, setScale] = useSpring(() => ({ scaleX: 1, scaleY: 1 }));

    const containerRef = useRef(null);

    const set: DragSetSpring = (args) => {
        if (args.y !== undefined) setY(args);
        if (args.x !== undefined) setX(args);
        if (args.scaleX !== undefined) setScale(args);
    };

    const dragCallback = isSelected
        ? dragSelected({
              onImageDismiss: () => unsetSelectedImage(id),
              x,
              y,
              set,
              setBackgroundSpring,
              width,
          })
        : dragUnselected({ setSelectedImage: () => setSelectedImage(id) });

    const bind = useDrag(dragCallback as any);

    useEffect(() => {
        setSpring({
            id,
            springVals: {
                x,
                y,
                scaleX,
                scaleY,
            },
            set,
        });
    }, []);

    return (
        <div>
            <StyledBox
                height={height}
                isSelected={isSelected}
                ref={containerRef}
                as={animated.div}
                data-flip-key={id}
                {...bind()}
                style={{
                    zIndex: interpolate([x, y], (x, y) => {
                        const animationInProgress = x !== 0 || y !== 0;
                        if (isSelected) return 5;
                        if (zIndexQueue.slice(-1)[0] === id && animationInProgress) return 5;
                        if (zIndexQueue.indexOf(id) > -1 && animationInProgress) return 2;
                        return 1;
                    }),
                    transform: interpolate([x, y, scaleX, scaleY], (x, y, scaleX, scaleY) => {
                        return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
                    }),
                }}
            >
                <CustomImage w="100%" h="100%" objectFit="cover" src={img.url} alt="landscape" draggable={false} />
            </StyledBox>
        </div>
    );
};

export type ImageGridItemProps = {
    setSelectedImage: (id?: PhotoGridItem["id"]) => void;
    unsetSelectedImage: (id: PhotoGridItem["id"]) => void;
    img: PhotoGridItem;
    id: PhotoGridItem["id"];
    setSpring: ({ id, springVals, set }: any) => void;
    isSelected: boolean;
    setBackgroundSpring: ReturnType<typeof useSpring>[1];
    zIndexQueue: any[];
    height: number;
    width: number;
};

const StyledBox = styled(Box)`
    transform-origin: 0 0;
    position: relative;
    touch-action: manipulation;
    ${(props: any) =>
        props.isSelected
            ? css`
                  height: 100vw;
                  position: fixed;
                  top: calc(${props.height / 2}px - 50vw);
                  left: 0;
                  right: 0;
                  touch-action: none;
              `
            : css`
                  height: calc(33.33vw - 0.666rem);
              `}
    > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const threshold = 10;
const maxYTranslate = 150;
const yStops: Vector2 = [0, maxYTranslate];
const xStops: Vector2 = [-20, 20];
const scaleStops: Vector2 = [1, 0.75];

export const dragUnselected = ({ setSelectedImage }: Pick<ImageGridItemProps, "setSelectedImage">) => ({
    last,
    movement,
}: Pick<CommonGestureState, "last" | "movement">) => {
    if (last && Math.abs(movement[0]) + Math.abs(movement[1]) < 2) {
        setSelectedImage();
    }
};

type VelocityTrackedAnimatedValue<T = number> = OpaqueInterpolation<T> & { value?: T; lastVelocity?: number };
type DragSetSpring = (args: any) => void;

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
    set: DragSetSpring;
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

    setBackgroundSpring({
        opacity: rangeMap(yStops, [1.5, 0.5], newY),
    });

    return memo;
};
