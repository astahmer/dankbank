import { Box, BoxProps, Text } from "@chakra-ui/core";

export type AutocompleteGhostProps = BoxProps & {
    /** Actual css width of the ghost container */
    ghostWidth: number;
    /** Suggested text */
    ghostValue: string;
    /** Current user input leading to that suggested text */
    value: string;
};

export function AutocompleteGhost({ ghostWidth, ghostValue, value, ...props }: AutocompleteGhostProps) {
    return (
        <Box
            pos="absolute"
            top="50%"
            transform="translateY(-50%)"
            textTransform="lowercase"
            userSelect="none"
            opacity={0.4}
            isTruncated
            {...props}
            style={{ width: ghostWidth }}
        >
            <Text as="span" style={{ visibility: "hidden" }}>
                {ghostValue?.slice(0, value.length)}
            </Text>

            <Text as="span">{ghostValue?.slice(value.length)}</Text>
        </Box>
    );
}
