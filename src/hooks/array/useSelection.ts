import { Dispatch, SetStateAction, useCallback, useState } from "react";

export type UseSelectionProps<T = any> = {
    getId: (item: T) => string | number;
    max?: number;
};

export function useSelection<T = any>({ getId, max }: UseSelectionProps<T>): Selection<T> {
    const [selected, setSelected] = useState([]);
    const add = (item: T | T[]) => {
        if (max) {
            if (selected.length >= max) {
                return;
            }
            if (Array.isArray(item)) {
                item = item.slice(0, max - selected.length);
            }
        }

        setSelected(selected.concat(item));
    };
    const remove = useCallback(
        (indexOrItem: number | T) => {
            let index = indexOrItem;
            if (typeof indexOrItem !== "number") {
                index = find(indexOrItem, true);
            }

            selected.splice(index as number, 1);
            setSelected([...selected]);
        },
        [selected]
    );
    const reset = useCallback(() => setSelected([]), []);

    const find = useCallback(
        (item: T, findIndex?: boolean) =>
            selected[findIndex ? "findIndex" : "find"]((selectedItem) => getId(selectedItem) === getId(item)),
        [selected]
    );

    const has = useCallback((item: T) => find(item) !== undefined, [selected]);

    const toggle = useCallback(
        (item: T) => {
            const hasItem = has(item);
            if (hasItem) {
                remove(item);
            } else {
                add(item);
            }
            return hasItem;
        },
        [selected]
    );

    const orderBy = useCallback((compareFn: (a: T, b: T) => number) => setSelected([...selected].sort(compareFn)), []);

    return [selected, { set: setSelected, reset, add, remove, find, has, toggle, orderBy }];
}

export type SelectionActions<T = any> = {
    set: Dispatch<SetStateAction<any[]>>;
    reset: () => void;
    add: (item: T | T[]) => void;
    remove: (indexOrItem: number | T) => void;
    find: (item: T, findIndex?: boolean) => T;
    has: (item: T) => boolean;
    toggle: (item: T) => boolean;
    orderBy: (compareFn: (a: T, b: T) => number) => void;
};
export type Selection<T = any> = [T[], SelectionActions<T>];
