import {
    EffectCallback, EventHandler, MutableRefObject, SyntheticEvent, useEffect, useLayoutEffect
} from "react";

export const isDev = process.env.NODE_ENV === "development";

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function waitMs(duration: number, callback?: Promise<any>) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(callback), duration);
    });
}

/** Make a value type-safe in scope using a guard condition */
export const isType = <T>(_value: any, condition?: boolean): _value is T => condition;

/** Recursively traverse object prop path to return object prop */
export const getProp = (obj: Record<string, any>, path: string) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj);

/** Recursively sets a value on prop at given path for passed obj */
export const setProp = (obj: Record<string, any>, path: string[], value: any): Record<string, any> => {
    if (!obj || typeof obj !== "object" || !path.length) {
        if (isDev) {
            console.warn("Error while setting nested prop: ", obj, path, value);
        }
        return;
    }

    if (path.length === 1) {
        obj[path[0]] = value;
        return value;
    } else if (!(path[0] in obj)) {
        obj[path[0]] = {};
    }

    return setProp(obj[path[0]], path.slice(1), value);
};

/** Returns a random string of given length */
export const getRandomString = (len = 10) =>
    Math.random()
        .toString(36)
        .substring(2, len) +
    Math.random()
        .toString(36)
        .substring(2, len);

/** Returns a hash for a given string */
export function getHashCode(str: string) {
    let hash = 0;
    if (str.length === 0) {
        return hash;
    }

    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}

/** Returns a FormData by appending each data object keys as value */
export function makeFormData(data: any) {
    const formData = new FormData();
    let key;
    for (key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}

/** Sugar for rounding float number with x decimal */
export const round = (number: number, decimal: number = 2) =>
    Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);

export const chunk = <T = any>(arr: T[], size: number): T[][] =>
    arr.reduce((chunks, el, i) => (i % size ? chunks[chunks.length - 1].push(el) : chunks.push([el])) && chunks, []);

export const makeTranslate3d = (x: string | number, y: string | number = 0, z: string | number = 0, unit = "px") =>
    `translate3d(${x}${unit},${y}${unit},${z}${unit})`;
export const vwToPixel = (value: number) => (window.innerWidth * value) / 100;
export const vhToPixel = (value: number) => (window.innerHeight * value) / 100;

export function debounce(fn: Function, wait: number) {
    let t: NodeJS.Timeout;
    return function(...args: any) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

export const throttle = <T extends []>(callback: (..._: T) => void, wait: number): ((..._: T) => void) => {
    const next = () => {
        timeout = clearTimeout(timeout) as undefined;
        callback(...lastArgs);
    };
    let timeout: NodeJS.Timeout | undefined;
    let lastArgs: T;

    return (...args: T) => {
        lastArgs = args;

        if (timeout === void 0) {
            timeout = setTimeout(next, wait);
        }
    };
};

export const buildIntersectionThresholdList = (stepCount: number) =>
    Array(stepCount)
        .fill(null)
        .map((item, i) => i / stepCount);

export const areArrayEqual = (arr1: any[], arr2: any[]) => {
    let i = arr1.length;
    while (i--) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
};

// https://github.com/granteagon/move/
export function move<T = any>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const item = arr[fromIndex];
    const length = arr.length;
    const diff = fromIndex - toIndex;

    if (diff > 0) {
        // move left
        return [...arr.slice(0, toIndex), item, ...arr.slice(toIndex, fromIndex), ...arr.slice(fromIndex + 1, length)];
    } else if (diff < 0) {
        // move right
        const targetIndex = toIndex + 1;
        return [
            ...arr.slice(0, fromIndex),
            ...arr.slice(fromIndex + 1, targetIndex),
            item,
            ...arr.slice(targetIndex, length),
        ];
    }
    return arr;
}

/**
 * Limit int between a given interval
 * @example limit(18, [-4, 6]) = 6
 * @example limit(-9, [-4, 6]) = -4
 */
export const limit = (nb: number, [min, max]: [number, number]) => Math.min(Math.max(nb, min), max);

/**
 * Sort an array by a given key property using an already ordered array
 * @example
 * mapOrder([{ index: 0 }, { index: 1 }, { index: 2}], [2, 0, 1], "index")
 *  = [{ index: 2 }, { index: 0 }, { index: 1}]
 */
export const mapOrder = <T = any>(arr: T[], ordered: number[], key: string) =>
    [...arr].sort((a, b) => ordered.indexOf((a as any)[key]) - ordered.indexOf((b as any)[key]));

// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
export async function future<T = any>(promise: Promise<T>): Promise<[Error?, T?]> {
    try {
        return [null, await promise];
    } catch (error) {
        return [error];
    }
}

// https://gist.github.com/bisubus/2da8af7e801ffd813fab7ac221aa7afc

export const pick = <T extends object>(obj: T, props: string[]): Partial<T> =>
    Object.entries(obj)
        .filter(([key]) => props.includes(key))
        .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

export const omit = <T extends object>(obj: T, props: string[]): Partial<T> =>
    Object.entries(obj)
        .filter(([key]) => !props.includes(key))
        .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

// Shorthand
export const on = (obj: any, ...args: any[]) => obj.addEventListener(...args);
export const off = (obj: any, ...args: any[]) => obj.removeEventListener(...args);

/**
 * Chakra-UI utils functions
 * Taken directly from https://github.com/chakra-ui/chakra-ui/blob/master/packages/chakra-ui/src/utils/index.js
 */
export function setRef<T = any>(ref: Function | MutableRefObject<T>, value: any) {
    if (typeof ref === "function") {
        ref(value);
    } else if (ref) {
        ref.current = value;
    }
}

/** Will useLayoutEffect when rendering on client and fallback on useEffect on server-side */
export const useEnhancedEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Will useLayoutEffect only when rendering on client */
export const useClientEffect = (callback: EffectCallback, deps?: any[]) =>
    process.browser &&
    useLayoutEffect(() => {
        return callback();
    }, [...deps]);

/** Wrap an existing event handler with another if event.preventDefault wasn't called in the first  */
export const wrapEvent = <T extends SyntheticEvent = SyntheticEvent>(
    theirHandler: EventHandler<T>,
    ourHandler: EventHandler<T>
) => (event: T) => {
    if (theirHandler) {
        theirHandler(event);
    }

    if (!event.defaultPrevented) {
        return ourHandler(event);
    }
};

/**
 * End of Chakra-UI utils
 */

// Polyfill for ES7 Object.fromEntries taken from https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js
export function ObjectFromEntries(iter: any): Record<string, string> {
    const obj = {};

    for (const pair of iter) {
        if (Object(pair) !== pair) {
            throw new TypeError("iterable for fromEntries should yield objects");
        }

        // Consistency with Map: contract is that entry has "0" and "1" keys, not
        // that it is an array or iterable.

        const { "0": key, "1": val } = pair;

        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val,
        });
    }

    return obj;
}

// https://github.com/preactjs/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
export function shallowDiffers(a: Record<any, any>, b: Record<any, any>) {
    for (let i in a) if (!(i in b)) return true;
    for (let i in b) if (a[i] !== b[i]) return true;
    return false;
}
