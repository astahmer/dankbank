import { Flex } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { ReactNode, useContext, useMemo } from "react";
import {
    IoMdAddCircle, IoMdContact, IoMdHeart, IoMdHome, IoMdLogIn, IoMdSearch
} from "react-icons/io";

import { BackBtn } from "@/components/buttons/BackBtn";
import { Header, TabBar } from "@/components/layout";
import { ColorToggle } from "@/components/layout/Color/ColorToggle";
import { useClientEffect } from "@/functions/utils";
import { AuthContext } from "@/hooks/async/useAuth";
import { useResponsive } from "@/hooks/dom/useResponsive";
import { AuthAccess } from "@/services/AuthManager";

import { PageHead, PageHeadProps } from "./PageHead";

export type PageProps = { head: PageHeadProps };
export type PageLayoutProps = { children: ReactNode } & PageProps;

export const PageLayout = ({ children, head }: PageLayoutProps) => {
    const { isMobile, height } = useResponsive();
    const { isTokenValid } = useContext(AuthContext);
    const router = useRouter();

    const shownLinks = useMemo(() => links.filter((link) => getAuthorizedAccess(isTokenValid).includes(link.access)), [
        router.route,
        isTokenValid,
    ]);

    // Scroll back on active input when focusing it on mobile (and thefore resizing window through keyboard showing)
    useClientEffect(() => {
        if (isMobile && inputTags.includes(document.activeElement.tagName)) {
            document.activeElement.scrollIntoView();
        }
    }, [height]);

    return (
        <Flex
            id="dankbank-app"
            display="flex"
            w="100vw"
            minH="100vh"
            height="100vh"
            overflow="hidden"
            direction="column"
            justifyContent="space-between"
        >
            <PageHead {...head} />
            {!isMobile && <Header links={shownLinks} />}
            <Flex justify="space-between">
                <BackBtn />
                <ColorToggle ml="auto" />
            </Flex>
            <Flex direction="column" flexGrow={1} paddingBottom="48px">
                {children}
            </Flex>
            <TabBar tabs={shownLinks} pos="fixed" bottom="0" left="0" right="0" zIndex={3} />
        </Flex>
    );
};

export interface ILinkItem {
    name?: string;
    route?: string;
}

export const getAuthorizedAccess = (isTokenValid: boolean) =>
    isTokenValid ? [AuthAccess.LOGGED, AuthAccess.BOTH] : [AuthAccess.ANONYMOUS, AuthAccess.BOTH];

const links = [
    { route: "/", name: "Home", icon: IoMdHome, access: AuthAccess.LOGGED },
    { route: "/search", name: "Search", icon: IoMdSearch, access: AuthAccess.BOTH },
    { route: "/add", name: "Add", icon: IoMdAddCircle, access: AuthAccess.BOTH },
    { route: "/favorites", name: "Favorites", icon: IoMdHeart, access: AuthAccess.LOGGED },
    { route: "/profile", name: "Profile", icon: IoMdContact, access: AuthAccess.LOGGED },
    { route: "/auth", name: "Sign in", icon: IoMdLogIn, access: AuthAccess.ANONYMOUS },
];

const inputTags = ["INPUT", "TEXTAREA"];
