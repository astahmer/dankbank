import { MutableRefObject } from "react";
import * as Rematrix from "rematrix";

// Original https://github.com/aholachek/mobile-first-animation

// tiny FLIP technique handler that only does 1 animation at a time
export class Flipper<T = any> {
    private ref: MutableRefObject<HTMLElement>;
    private onBeforeFlip: FlipperOnBeforeFlip<T>;
    private onFlip: FlipperOnFlip<T>;
    private positions: Record<string, DOMRect>;

    constructor({ ref, onBeforeFlip, onFlip }: FlipperProps<T>) {
        this.ref = ref;
        this.onBeforeFlip = onBeforeFlip;
        this.onFlip = onFlip;
        this.positions = {};
    }

    // mark FLIP-able elements with this data attribute
    getEl = (id: string) =>
        this.ref.current && (this.ref.current.querySelector(`[data-flip-key=${id}]`) as HTMLElement);

    measure(id: string) {
        const el = this.getEl(id);
        if (el) return el.getBoundingClientRect();
    }

    beforeFlip(id: string) {
        this.positions[id] = this.measure(id);
    }

    flip(id: string, data?: T) {
        const el = this.getEl(id);

        if (!el) {
            console.warn("No element was found for data-flip-key=", id);
            return;
        }
        if (!this.positions[id]) {
            console.warn(
                `You need to register the position of the element ( key: ${id}) using beforeFlip method.`,
                el,
                this.positions
            );
            return;
        }

        // cache the current transform for interruptible animations
        const startTransform = Rematrix.fromString(el.style.transform);
        // we need to figure out what the "real" final state is without any residual transform from an interrupted animation
        el.style.transform = "";

        this.onBeforeFlip?.({ id, element: this.getEl(id), data });
        const after = this.measure(id);
        const before = this.positions[id];

        const scaleX = before.width / after.width;
        const scaleY = before.height / after.height;

        const x = before.left - after.left;
        const y = before.top - after.top;

        const transformsArray = [
            startTransform,
            Rematrix.translateX(x),
            Rematrix.translateY(y),
            Rematrix.scaleX(scaleX),
            Rematrix.scaleY(scaleY),
        ];

        const matrix = transformsArray.reduce(Rematrix.multiply);

        const diff = {
            x: matrix[12],
            y: matrix[13],
            scaleX: matrix[0],
            scaleY: matrix[5],
        };
        // immediately apply new styles before the next frame
        el.style.transform = `translate(${diff.x}px, ${diff.y}px) scaleX(${diff.scaleX}) scaleY(${diff.scaleY})`;

        // let the consumer decide how the actual animation should be done
        const params = { diff, data, after, before };
        this.onFlip(id, params);
        return params;
    }
}

export type FlipperProps<T = any> = {
    ref: MutableRefObject<HTMLElement>;
    onBeforeFlip?: FlipperOnBeforeFlip<T>;
    onFlip: FlipperOnFlip<T>;
};

export type FlipperDiff = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
};

export type FlipperOnBeforeFlipProps<T = any> = { id: string; element: HTMLElement; data?: T };

export type FlipperOnFlipParams<T = any> = { diff: FlipperDiff; data?: T; before: DOMRect; after: DOMRect };
export type FlipperOnFlip<T = any> = (id: string, params: FlipperOnFlipParams<T>) => void;
export type FlipperOnBeforeFlip<T = any> = (props: FlipperOnBeforeFlipProps<T>) => void;
