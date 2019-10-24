import { Dispatch, SetStateAction, useCallback, useState } from "react";

export type useSelectionProps<T = any> = {
    getId: (item: T) => string | number;
    max?: string | number;
};

export type SelectionActions<T = any> = {
    set: Dispatch<SetStateAction<any[]>>;
    reset: () => void;
    add: (item: T) => void;
    remove: (indexOrItem: number | T) => void;
    find: (item: T, findIndex?: boolean) => T;
    has: (item: T) => boolean;
    toggle: (item: T) => void;
};
export type Selection<T = any> = [T[], SelectionActions<T>];

export function useSelection<T = any>({ getId, max }: useSelectionProps<T>): Selection<T> {
    const [selected, setSelected] = useState([]);
    const add = (item: T) => {
        if (max && selected.length >= max) {
            return;
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
            if (has(item)) {
                remove(item);
            } else {
                add(item);
            }
        },
        [selected]
    );

    return [selected, { set: setSelected, reset, add, remove, find, has, toggle }];
}
