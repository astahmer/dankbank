import { Box, Flex, PseudoBox, useColorMode } from "@chakra-ui/core";
import { FlexProps } from "@chakra-ui/core/dist/Flex";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import { IconType } from "react-icons/lib/cjs";

import { COMMON_COLORS, TAB_BAR_BTN_COLORS } from "@/config/theme";

import { ILinkItem } from "./Page/PageLayout";

export interface ITabLinkItem extends ILinkItem {
    name: string;
    icon: IconType;
    content?: ReactNode;
    isDisabled?: boolean;
}

type TabBarProps = Omit<FlexProps, "children"> & { tabs: ITabLinkItem[]; onChange?: Function };

export function TabBar({ tabs, onChange, ...props }: TabBarProps) {
    const { colorMode } = useColorMode();
    const router = useRouter();

    const selectedIndex = useMemo(() => tabs.findIndex((tabLink) => tabLink.route === router.route), [router.route]);
    const handleChange = onChange ? (index: any) => onChange(index) : undefined;

    return (
        <Flex onChange={handleChange} {...props}>
            <Flex w="100%" maxW="100%" overflowX="auto">
                {tabs.map((tab, i) => (
                    <Link key={i} href={tab.route} passHref>
                        <PseudoBox
                            as="a"
                            textDecoration="none"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            width="100%"
                            paddingY="8px"
                            bg={COMMON_COLORS.bgColor[colorMode]}
                            color={COMMON_COLORS.color[colorMode]}
                            aria-selected={i === selectedIndex}
                            _selected={{ color: TAB_BAR_BTN_COLORS.selected[colorMode] }}
                        >
                            <Box as={tab.icon} size="24px" />
                            <Box fontSize="12px">{tab.name}</Box>
                        </PseudoBox>
                    </Link>
                ))}
            </Flex>
        </Flex>
    );
}
