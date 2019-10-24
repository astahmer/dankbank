import { EventHandler, MutableRefObject, SyntheticEvent, useEffect, useLayoutEffect } from "react";

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

export const isType = <T>(_value: any, condition?: boolean): _value is T => condition;

export const getProp = (obj: Record<string, any>, path: string) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj);

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

// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
export async function future<T = any>(promise: Promise<T>): Promise<[Error?, T?]> {
    try {
        return [null, await promise];
    } catch (error) {
        return [error];
    }
}

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

export const useEnhancedEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
