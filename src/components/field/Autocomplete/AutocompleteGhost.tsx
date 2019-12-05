import { Box, BoxProps, Text } from "@chakra-ui/core";

export type AutocompleteGhostProps = BoxProps & { ghostWidth: number; ghostValue: string; value: string };

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
                {ghostValue.slice(0, value.length)}
            </Text>

            <Text as="span">{ghostValue.slice(value.length)}</Text>
        </Box>
    );
}
