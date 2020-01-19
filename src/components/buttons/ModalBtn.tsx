import { Box, useColorMode } from "@chakra-ui/core";
import { useRef, useState } from "react";
import { IoMdMore } from "react-icons/io";
import { animated, config, useTransition } from "react-spring";

import { setRef } from "@/functions/utils";
import { useClickOutside } from "@/hooks/dom";

import { RelativePortal, RelativePortalProps } from "../layout/RelativePortal";
import { ActionBtn } from "./";
import { ActionBtnProps } from "./ActionBtn";

export type ModalBtnProps = ActionBtnProps & ChildrenProp & Pick<RelativePortalProps, "options">;
export const PORTAL_ID = "full-portals";

export function ModalBtn({ children, options, ...props }: ModalBtnProps) {
    const [isOpen, setOpen] = useState(false);

    const innerRef = useRef<HTMLElement>();
    const setInnerRef = (element: HTMLElement) => setRef(innerRef, element);

    const containerRef = useRef(document.getElementById(PORTAL_ID) || document.body);
    useClickOutside(innerRef, () => setOpen(false));

    const transitions = useTransition(isOpen, null, {
        config: { tension: 500, friction: !isOpen ? 40 : 30 },
        from: { opacity: 0, transform: "translate3d(100%, 0, 0)" },
        enter: { opacity: 1, transform: "translate3d(0%, 0, 0)" },
        leave: { opacity: 0, transform: "translate3d(0, 0, 0)" },
    });

    const { colorMode } = useColorMode();
    const bg = colorMode === "dark" ? "gray.800" : "gray.300";

    return (
        <div ref={setInnerRef}>
            <RelativePortal
                container={() => containerRef.current}
                options={{ placement: ["right", "center"], ...options, trigger: isOpen, usePageOffset: false }}
                boxProps={{ transform: "translateX(-100%)", zIndex: 2 }}
                element={
                    <ActionBtn
                        variant="ghost"
                        size="md"
                        label="Back"
                        icon={IoMdMore}
                        fontSize="2xl"
                        _focus={{}}
                        {...props}
                        onClick={() => setOpen(!isOpen)}
                    />
                }
            >
                {transitions.map(
                    ({ item, key, props: styles }) =>
                        item && (
                            <AnimatedBox
                                key={key}
                                style={styles}
                                pointerEvents="all"
                                bg={bg}
                                px="10px"
                                py="8px"
                                w={180}
                                fontSize={15}
                            >
                                {children}
                            </AnimatedBox>
                        )
                )}
            </RelativePortal>
        </div>
    );
}

const AnimatedBox = animated(Box);
