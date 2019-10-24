import { Box, Flex, useColorMode } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { ReactNode, useContext, useMemo } from "react";
import {
    IoMdAddCircle, IoMdContact, IoMdFlame, IoMdHeart, IoMdHome, IoMdLogIn, IoMdSearch
} from "react-icons/io";

import { BackBtn } from "@/components/buttons/BackBtn";
import { ColorToggle } from "@/components/layout/Color/ColorToggle";
import { Header } from "@/components/layout/Header";
import { useResponsive } from "@/components/layout/ResponsiveLayout";
import { TabBar } from "@/components/layout/TabBar";
import { COMMON_COLORS } from "@/config/theme";
import { AuthContext } from "@/functions/hooks/useAuth";
import { AuthAccess } from "@/services/AuthManager";

import { PageHead, PageHeadProps } from "./PageHead";

export type PageProps = { head: PageHeadProps };
export type PageLayoutProps = { children: ReactNode } & PageProps;

export const PageLayout = ({ children, head }: PageLayoutProps) => {
    const { colorMode } = useColorMode();
    const { isMobile } = useResponsive();
    const { isTokenValid } = useContext(AuthContext);
    const router = useRouter();

    const authAccess = isTokenValid ? [AuthAccess.LOGGED, AuthAccess.BOTH] : [AuthAccess.ANONYMOUS, AuthAccess.BOTH];
    const shownLinks = useMemo(() => links.filter((link) => authAccess.includes(link.access)), [
        router.route,
        isTokenValid,
    ]);
    const [bg, color] = [COMMON_COLORS.bgColor[colorMode], COMMON_COLORS.color[colorMode]];

    return (
        <Box id="dankbank-app" display="flex" minW="100vw" maxW="100vw" minH="100vh" maxH="100vh">
            <PageHead {...head} />
            <Flex direction="column" justifyContent="space-between" width="100%" bg={bg} color={color}>
                {!isMobile && <Header links={shownLinks} />}
                <Flex flex="1" direction="column" p="20px" overflowY="auto">
                    <Flex justify="space-between">
                        <BackBtn />
                        <ColorToggle ml="auto" />
                    </Flex>
                    <Flex direction="column" flex="1">
                        {children}
                    </Flex>
                </Flex>
                {isMobile && <TabBar tabs={shownLinks} />}
            </Flex>
        </Box>
    );
};

export interface ILinkItem {
    name?: string;
    route?: string;
}

const links = [
    { route: "/", name: "Home", icon: IoMdHome, access: AuthAccess.LOGGED },
    { route: "/search", name: "Search", icon: IoMdSearch, access: AuthAccess.BOTH },
    { route: "/add", name: "Add", icon: IoMdAddCircle, access: AuthAccess.LOGGED },
    { route: "/favorites", name: "Favorites", icon: IoMdHeart, access: AuthAccess.LOGGED },
    { route: "/profile", name: "Profile", icon: IoMdContact, access: AuthAccess.LOGGED },
    { route: "/login", name: "Login", icon: IoMdLogIn, access: AuthAccess.ANONYMOUS },
    { route: "/register", name: "Register", icon: IoMdFlame, access: AuthAccess.ANONYMOUS },
];
