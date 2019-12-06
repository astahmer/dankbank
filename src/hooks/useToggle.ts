import { useState } from "react";

export function useToggle(defaultState?: boolean): UseToggle {
    const [isOpen, setOpen] = useState(defaultState);
    const open = () => setOpen(true);
    const close = () => setOpen(false);
    const toggle = (state?: boolean) => setOpen(state || !isOpen);

    return [isOpen, { open, close, toggle }];
}

export type UseToggle = [
    boolean,
    {
        open: () => void;
        close: () => void;
        toggle: (state?: boolean) => void;
    }
];
