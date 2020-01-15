import { Box, BoxProps, Portal, PortalProps } from "@chakra-ui/core";
import { cloneElement, ReactElement, useCallback, useRef } from "react";

import { setRef } from "@/functions/utils";
import { useRelativePosition, UseRelativePositionOptions } from "@/hooks/dom/useRelativePosition";

// Inspired of https://github.com/sunify/react-relative-portal

export function RelativePortal({ element, children, boxProps, options, ...portalProps }: RelativePortalProps) {
    const elementRef = useRef<HTMLElement>();
    const getElementRef = useCallback((node) => setRef(elementRef, node), []);
    const [getWrapperRef] = useRelativePosition(elementRef, options);

    return (
        <>
            {cloneElement(element, { ref: getElementRef, ...element.props })}
            <Portal {...portalProps}>
                <Box pos="absolute" {...boxProps} ref={getWrapperRef}>
                    {children}
                </Box>
            </Portal>
        </>
    );
}

type RelativePortalProps = PortalProps & {
    element: ReactElement;
    boxProps?: BoxProps;
    options?: UseRelativePositionOptions;
};
