import { MutableRefObject } from "react";
import * as Rematrix from "rematrix";

// Original https://github.com/aholachek/mobile-first-animation

// tiny FLIP technique handler that only does 1 animation at a time
class Flipper {
    private ref: MutableRefObject<HTMLElement>;
    private onFlip: FlipperOnFlip;
    private positions: any;

    constructor({ ref, onFlip }: { ref: MutableRefObject<HTMLElement>; onFlip: FlipperOnFlip }) {
        this.ref = ref;
        this.onFlip = onFlip;
        this.positions = {};
    }
    // mark FLIP-able elements with this data attribute
    getEl = (id: string) => this.ref.current.querySelector(`[data-flip-key=${id}]`) as HTMLElement;

    measure(id: string) {
        const el = this.getEl(id);
        if (el) return el.getBoundingClientRect();
    }

    beforeFlip(id: string) {
        this.positions[id] = this.measure(id);
    }

    flip(id: string, data?: any) {
        const el = this.getEl(id);
        // cache the current transform for interruptible animations
        const startTransform = Rematrix.fromString(el.style.transform);
        // we need to figure out what the "real" final state is without any residual transform from an interrupted animation
        el.style.transform = "";

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
        this.onFlip(id, diff, data);
    }
}

export default Flipper;

export type FlipperDiff = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
};

export type FlipperOnFlip = (id: string, diff: FlipperDiff, data: any) => void;
