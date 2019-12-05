import { IconButton, IconButtonProps, useColorMode } from "@chakra-ui/core";
import { MouseEvent } from "react";

import { wrapEvent } from "@/functions/utils";

type Props = { label?: string; shouldStop?: boolean };
export type ActionBtnProps = Optional<IconButtonProps, "aria-label"> & Props;

export function ActionBtn({
    label = "button",
    shouldStop = true,
    onClick,
    size = "sm",
    icon,
    ...props
}: ActionBtnProps) {
    const { colorMode } = useColorMode();

    const handleClick = wrapEvent(onClick, (event: MouseEvent) => {
        shouldStop && event.stopPropagation();
    });

    const boxShadow = colorMode === "light" ? "0 0px 3px 1px rgba(0,0,0,0.2)" : null;

    return (
        <IconButton
            aria-label={label}
            size={size}
            icon={icon}
            boxShadow={boxShadow}
            borderRadius="50%"
            {...props}
            onClick={handleClick}
        />
    );
}
