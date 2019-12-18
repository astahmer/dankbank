import {
    Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Text, useColorMode
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
    withHeader?: boolean;
    withFooter?: boolean;
    withCloseBtn?: boolean;
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
    withHeader = true,
    withFooter = true,
    withCloseBtn = true,
}: ModalProps) {
    const [immediate, setImmediate] = useState(false);

    const { colorMode } = useColorMode();
    const color = colorMode === "dark" ? "gray.100" : "inherited";

    useEffect(() => {
        setImmediate(!isOpen);
    }, [isOpen]);

    const makeModal = (styles: any = {}) => (
        <Modal isOpen={isOpen} onClose={close} isCentered scrollBehavior={"inside"}>
            <ModalOverlay opacity={styles.opacity} />

            <ModalContent w="100vw" h="100vh" maxH="100vh" noStyles {...styles}>
                {withHeader && <ModalHeader>{header || <Text color={color}>{title}</Text>}</ModalHeader>}

                {withCloseBtn && <ModalCloseButton color={color} />}

                <ModalBody overflowY="auto" display="flex" paddingX="10px" mt={!header && !title && "10px"}>
                    {body || children}
                </ModalBody>

                {withFooter && (
                    <ModalFooter pt="5px" pb="10px">
                        {footer || (
                            <Flex w="100%" justify="flex-end">
                                <Button variant="outline" mr={3} onClick={close}>
                                    Close
                                </Button>
                            </Flex>
                        )}
                    </ModalFooter>
                )}
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
