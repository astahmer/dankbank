import { Box, useColorMode } from "@chakra-ui/core";
import { memo, useEffect } from "react";
import { animated, interpolate, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import { useVelocityTrackedSpring } from "@/hooks/dom/useVelocityTrackedSpring";

import { getSelectedCss } from "../ExpandableGrid/config";
import { dragSelected, dragUnselected } from "../ExpandableGrid/drag";

export const ExpandableBox = memo(function({
    identifier,
    isExpanded,
    setSelected,
    unselect,
    storeSpringSet,
    width,
    height,
    setBackgroundSpring,
    children,
}: ExpandableBoxProps) {
    const { colorMode } = useColorMode();
    const [{ y }, setY] = useVelocityTrackedSpring(() => ({ y: 0 }));
    const [{ x }, setX] = useSpring(() => ({ x: 0 }));
    const [{ scaleX, scaleY }, setScale] = useSpring(() => ({ scaleX: 1, scaleY: 1 }));

    const set = (args: any) => {
        if (args.y !== undefined) setY(args);
        if (args.x !== undefined) setX(args);
        if (args.scaleX !== undefined) setScale(args);
    };

    useEffect(() => {
        storeSpringSet(set);
    }, []);

    const dragCallback = isExpanded
        ? dragSelected({
              onImageDismiss: () => unselect(),
              x,
              y,
              set,
              setBackgroundSpring,
              width,
          })
        : dragUnselected({ doSelect: () => setSelected() });

    const bind = useDrag(dragCallback as any);

    return (
        <Box pos="relative" zIndex={isExpanded ? 10 : 1}>
            <Box
                as={animated.div}
                data-flip-key={identifier}
                pos="relative"
                display="flex"
                bg={colorMode === "light" ? "gray.100" : "blue.900"}
                height="100%"
                transformOrigin="0 0"
                css={isExpanded ? getSelectedCss(height) : { touchAction: "manipulation" }}
                {...bind()}
                style={{
                    transform: interpolate([x, y, scaleX, scaleY], (x, y, scaleX, scaleY) => {
                        return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
                    }),
                }}
            >
                {children}
            </Box>
        </Box>
    );
});

export type ExpandableBoxProps = {
    identifier: string;
    isExpanded: boolean;
    width: number;
    height: number;
} & {
    setSelected: () => void;
    unselect: () => void;
    storeSpringSet: (set: UseSpringSet) => void;
    setBackgroundSpring: UseSpringSet;
} & ChildrenProp;
