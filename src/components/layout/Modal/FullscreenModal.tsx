import {
    Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Text, useColorMode
} from "@chakra-ui/core";
import { ReactNode } from "react";
import { animated, useTransition } from "react-spring";

export function FullscreenModal({
    isOpen,
    close,
    children,
    title,
    header,
    body,
    footer,
    isAnimated = true, // TODO
    withHeader = true,
    withFooter = true,
    withCloseBtn = true,
}: ModalProps) {
    const { colorMode } = useColorMode();
    const color = colorMode === "dark" ? "gray.100" : "inherited";

    const transitions = useTransition(isOpen, null, {
        from: { opacity: 0, transform: "translate3d(-10px, 0, 0)" },
        enter: { opacity: 1, transform: "translate3d(0, 0, 0)" },
        leave: { opacity: 0, transform: "translate3d(10px, 0, 0)" },
    });

    return (transitions.map(
        ({ item, key, props }) =>
            item && (
                <Modal isOpen={true} onClose={close} isCentered scrollBehavior={"inside"} key={key}>
                    <AnimatedModalOverlay style={props} />

                    <AnimatedModalContent w="100vw" minW="100vw" h="100vh" maxH="100vh" noStyles style={props}>
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
                    </AnimatedModalContent>
                </Modal>
            )
    ) as any) as JSX.Element;
}

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

const AnimatedModalContent = animated(ModalContent);
const AnimatedModalOverlay = animated(ModalOverlay);
