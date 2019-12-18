import { Box, BoxProps, Button } from "@chakra-ui/core";
import { memo } from "react";

import { useToggle } from "@/hooks/useToggle";

export const Debug = memo(({ data, withToggle = true, initialState = true, boxProps }: DebugProps) => {
    const [isOpen, { toggle }] = useToggle(initialState);

    return (
        <Box maxW="100%">
            {withToggle && (
                <Button size="xs" onClick={() => toggle()}>
                    Toggle debug
                </Button>
            )}
            {isOpen && (
                <Box overflow="auto" p="5px" borderWidth="1px" fontSize="0.8rem" maxHeight="300px" {...boxProps}>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </Box>
            )}
        </Box>
    );
});

export type DebugProps = { data: object; withToggle?: boolean; initialState?: boolean; boxProps?: BoxProps };
