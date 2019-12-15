import { Box } from "@chakra-ui/core";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { ReactNode, useRef } from "react";

import { AutocompleteGhost, AutocompleteGhostProps } from "./Autocomplete/AutocompleteGhost";

export type InputWithGhostProps = InputProps & {
    containerWidth: number;
    input: ReactNode;
    shouldDisplayGhost: boolean;
    ghostProps: Omit<AutocompleteGhostProps, "ghostWidth">;
};

export const InputWithGhost = ({ input, containerWidth, shouldDisplayGhost, ...props }: InputWithGhostProps) => {
    const inputContainerRef = useRef<HTMLElement>(null);
    const inputContainerLeft = inputContainerRef.current ? inputContainerRef.current.offsetLeft : 0;
    const ghostWidth = containerWidth - inputContainerLeft - 20; // 10px for left padding & 10 for spacing ghost

    const ghostProps = { ghostWidth, ...props.ghostProps };

    return (
        <Box ref={inputContainerRef} pos="relative">
            {input}
            {shouldDisplayGhost ? <AutocompleteGhost {...ghostProps} /> : null}
        </Box>
    );
};
