import { Box, Flex } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { ReactNode, useContext, useMemo, useRef } from "react";
import {
    IoMdAddCircle, IoMdContact, IoMdHeart, IoMdHome, IoMdLogIn, IoMdSearch
} from "react-icons/io";

import { BackBtn } from "@/components/buttons/BackBtn";
import { TagsAutocomplete } from "@/components/field/TagsAutocomplete";
import { Header, TabBar } from "@/components/layout";
import { ColorToggle } from "@/components/layout/Color/ColorToggle";
import { makeTranslate3d, useClientEffect } from "@/functions/utils";
import { AuthContext } from "@/hooks/async/useAuth";
import { useResponsive } from "@/hooks/dom/useResponsive";
import { AuthAccess } from "@/services/AuthManager";

import { Swipable, SwipeAxis } from "../Swipable";
import { PageHead, PageHeadProps } from "./PageHead";

export type PageProps = { head: PageHeadProps };
export type PageLayoutProps = { children: ReactNode } & PageProps;

export const PageLayout = ({ children, head }: PageLayoutProps) => {
    const { isMobile, width, height } = useResponsive();
    const { isTokenValid } = useContext(AuthContext);
    const router = useRouter();

    const authAccess = isTokenValid ? [AuthAccess.LOGGED, AuthAccess.BOTH] : [AuthAccess.ANONYMOUS, AuthAccess.BOTH];
    const shownLinks = useMemo(() => links.filter((link) => authAccess.includes(link.access)), [
        router.route,
        isTokenValid,
    ]);

    const searchInputStyle = useRef<any>();
    // TODO
    useClientEffect(() => {
        searchInputStyle.current = { transform: makeTranslate3d(-width + 40) };
    }, []);

    // Scroll back on active input when focusing it on mobile (and thefore resizing window through keyboard showing)
    useClientEffect(() => {
        if (isMobile && inputTags.includes(document.activeElement.tagName)) {
            document.activeElement.scrollIntoView();
        }
    }, [height]);

    return (
        <Box id="dankbank-app" display="flex" w="100vw" minH="100vh">
            <PageHead {...head} />
            <Flex direction="column" justifyContent="space-between" width="100%">
                {!isMobile && <Header links={shownLinks} />}
                <Flex flex="1" direction="column">
                    <Flex justify="space-between">
                        <BackBtn />
                        <ColorToggle ml="auto" />
                    </Flex>
                    <Flex direction="column" flex="1" paddingBottom="48px">
                        {children}
                    </Flex>
                </Flex>
                {isMobile && (
                    <Swipable
                        axis={SwipeAxis.X}
                        xDistance={width - 30}
                        pos="fixed"
                        width="100%"
                        bottom="0px"
                        zIndex={1}
                    >
                        <TabBar tabs={shownLinks} />
                        <TagsAutocomplete
                            boxProps={{
                                pos: "absolute",
                                top: 0,
                                style: searchInputStyle.current || { visibility: "hidden" },
                            }}
                            setSelecteds={() => ({})}
                        />
                    </Swipable>
                )}
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
    { route: "/add", name: "Add", icon: IoMdAddCircle, access: AuthAccess.BOTH },
    { route: "/favorites", name: "Favorites", icon: IoMdHeart, access: AuthAccess.LOGGED },
    { route: "/profile", name: "Profile", icon: IoMdContact, access: AuthAccess.LOGGED },
    { route: "/auth", name: "Sign in", icon: IoMdLogIn, access: AuthAccess.ANONYMOUS },
];

const inputTags = ["INPUT", "TEXTAREA"];
