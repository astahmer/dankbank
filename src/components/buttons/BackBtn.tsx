import { Box, Icon, Tooltip } from "@chakra-ui/core";
import { BoxProps } from "@chakra-ui/core/dist/Box";
import { useContext } from "react";

import { HistoryContext } from "@/functions/hooks/useRouteHistory";

import { useResponsive } from "../layout/ResponsiveLayout";

export function BackBtn({ children, ...props }: BoxProps) {
    const { history, goBack } = useContext(HistoryContext);
    const prevUrl = history[history.length - 2];

    const { isMobile } = useResponsive();

    return prevUrl ? (
        <Box onClick={goBack} {...props}>
            {children || isMobile ? (
                <Icon name="chevron-left" />
            ) : (
                <Tooltip aria-label="Back button" label={prevUrl} placement="bottom">
                    <Icon name="chevron-left" />
                </Tooltip>
            )}
        </Box>
    ) : null;
}
