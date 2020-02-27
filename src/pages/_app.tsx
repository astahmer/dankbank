import "@/public/empty.css";

// TODO Remove that empty css & use NextJs built-in css imports
import App, { AppContext } from "next/app";
import React, { createContext } from "react";

import { PageHeadProps } from "@/components/layout/Page/PageHead";
import { redirectToHome, redirectToLogin } from "@/functions/route";
import { future } from "@/functions/utils";
import { AuthProvider } from "@/hooks/async/useAuth";
import { RouteHistoryProvider } from "@/hooks/useRouteHistory";
import { Auth, AuthAccess } from "@/services/AuthManager";
import { Cookies } from "@/services/CookieManager";
import { css, Global } from "@emotion/core";

import { ColorTheme } from "../components/layout/Color/ColorTheme";
import { PageLayout } from "../components/layout/Page/PageLayout";

export const ServerReqContext = createContext({
    userAgent: undefined,
    cookies: {} as Record<string, any>,
});

type BaseProps = { userAgent: string; cookies: Record<string, string>; newAccessToken?: string };
class BaseApp extends App<BaseProps> {
    static async getInitialProps(appContext: AppContext) {
        const routeAccess = appContext.Component.AuthAccess;
        const tokens = Cookies.get("tokens", appContext.ctx);

        // If access token is valid for at least 3 more seconds
        // 3 seconds is to avoid the case where token would be valid at this point but invalid when rendering page
        let hasValidToken = Auth.isTokenValid(tokens.accessToken, process.browser ? 0 : 3000);

        let newAccessToken;
        // No access token stored in cookies or has expired
        if (!tokens.accessToken || !hasValidToken) {
            if (tokens.refreshToken && Auth.isTokenValid(tokens.refreshToken)) {
                // Trying to refresh access token
                const [err, accessToken] = await future(Auth.refreshAccessToken(appContext.ctx));
                if (err) {
                    Auth.logout(appContext.ctx); // Removing auth cookies to avoid a redirect loop
                    redirectToLogin(appContext.ctx);
                    return { pageProps: {} };
                } else {
                    newAccessToken = accessToken;
                    hasValidToken = true;
                }
            } else {
                // No refresh token stored in cookies or has expired
                Auth.logout(appContext.ctx);

                if (AuthAccess.LOGGED === routeAccess) {
                    redirectToLogin(appContext.ctx);
                    return { pageProps: {} };
                }
            }
        }

        // Logged user trying to access anon page, redirecting
        if (AuthAccess.ANONYMOUS === routeAccess && hasValidToken) {
            redirectToHome(appContext.ctx);
            return { pageProps: {} };
        }

        // calls page's `getInitialProps` and fills `appProps.pageProps`
        const appProps = await App.getInitialProps(appContext);

        const userAgent = appContext.ctx.req ? appContext.ctx.req.headers["user-agent"] : navigator.userAgent;
        const cookies = Cookies.getAll(appContext.ctx);

        return { userAgent, cookies, newAccessToken, ...appProps };
    }

    render() {
        const { Component, pageProps, userAgent, cookies, newAccessToken } = this.props;
        const head = (Component as any).PageHead as PageHeadProps;

        return (
            <>
                <ServerReqContext.Provider value={{ userAgent, cookies }}>
                    <Global styles={globalStyle} />
                    <ColorTheme cookies={cookies}>
                        <RouteHistoryProvider>
                            <AuthProvider serverCookies={cookies} newAccessToken={newAccessToken}>
                                <PageLayout head={head}>
                                    <Component {...pageProps} />
                                </PageLayout>
                            </AuthProvider>
                        </RouteHistoryProvider>
                    </ColorTheme>
                </ServerReqContext.Provider>
            </>
        );
    }
}

const globalStyle = css`
    @font-face {
        font-family: "Lato", serif;
    }

    * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
    }

    :focus {
        outline: none;
    }

    html {
        font-family: "Lato", serif;
    }
    body {
        margin: 0;
        font-size: 1.3em;
        line-height: 1.5;
    }
    #full-portals {
        z-index: 100;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    a,
    a:visited,
    a:active {
        color: inherit;
    }

    button {
        -webkit-appearance: none;
        background-color: transparent;
    }

    button:active {
        border-style: solid;
    }
`;

export default BaseApp;
