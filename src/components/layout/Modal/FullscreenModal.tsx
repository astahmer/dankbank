import {
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text,
    useColorMode
} from "@chakra-ui/core";
import { ReactNode, useEffect, useState } from "react";
import { Transition } from "react-spring/renderprops.cjs";

type ModalProps = Optional<ChildrenProp> & {
    isOpen: boolean;
    close: () => void;
    title?: string;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    isAnimated?: boolean;
};

export function FullscreenModal({
    isOpen,
    close,
    children,
    title,
    header,
    body,
    footer,
    isAnimated = true,
}: ModalProps) {
    const [immediate, setImmediate] = useState(false);

    const { colorMode } = useColorMode();
    const color = colorMode === "dark" ? "gray.100" : "inherited";

    useEffect(() => {
        setImmediate(!isOpen);
    }, [isOpen]);

    const makeModal = (styles: any = {}) => (
        <Modal isOpen={isOpen} onClose={close} isCentered>
            <ModalOverlay opacity={styles.opacity} />

            <ModalContent w="100vw" h="100vh" {...styles}>
                <ModalHeader>{header || <Text color={color}>{title}</Text>}</ModalHeader>
                <ModalCloseButton color={color} />
                <ModalBody display="flex" paddingX="10px" mt={!header && !title && "10px"}>
                    {body || children}
                </ModalBody>

                <ModalFooter pt="5px" pb="10px">
                    {footer}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return isAnimated ? (
        <Transition
            items={isOpen}
            from={{ opacity: 0, transform: "translate3d(-10px, 0, 0)" }}
            enter={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
            leave={{ opacity: 0, transform: "translate3d(10px, 0, 0)" }}
            immediate={immediate}
        >
            {(show) => show && ((styles) => makeModal(styles))}
        </Transition>
    ) : (
        makeModal()
    );
}
