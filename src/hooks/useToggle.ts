import { useState } from "react";

export function useToggle(defaultState?: boolean) {
    const [isOpen, setOpen] = useState(defaultState);
    const open = () => setOpen(true);
    const close = () => setOpen(false);
    const toggle = () => setOpen(!isOpen);

    return [isOpen, { open, close, toggle }] as const;
}
