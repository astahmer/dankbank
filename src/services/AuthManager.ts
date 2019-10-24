import axios from "axios";
import { NextPageContext } from "next";
import Router from "next/router";

import { API_ROUTES, axiosInstance, baseURL } from "@/config/api";
import { loginPath } from "@/functions/route";
import { IUser } from "@/types/entities/User";

import { Cookies } from "./CookieManager";
import { Memory } from "./MemoryManager";

let atobFn = process.browser ? atob : require("atob");

const axiosRefresh = axios.create({ baseURL, timeout: 5000 });

export type Token = { token: string; expiresAt: number };
export type JwtPayload = Pick<IUser, "id" | "name"> & { isRefreshToken?: boolean };
export type JwtDecoded = JwtPayload & { iat: number; exp: number };
type LoginArgs = { accessToken: string; refreshToken: string; user: JwtPayload };

export enum AuthAccess {
    ANONYMOUS,
    LOGGED,
    BOTH,
}

class AuthManager {
    private ctx: NextPageContext;

    parseToken(token: string) {
        if (!token) {
            return {};
        }

        const split = token.split(".");
        try {
            return JSON.parse(atobFn(split[1]));
        } catch (error) {
            return {};
        }
    }

    storeCurrentUser({ accessToken, refreshToken, user }: LoginArgs) {
        Cookies.set("tokens", { accessToken, refreshToken }, "1 day");
        Memory.set("user", user);
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
    }

    isTokenValid(token: string, safeDuration = 0) {
        const payload = this.parseToken(token);
        if (payload && payload.exp) {
            return Date.now() < payload.exp * 1000 - safeDuration;
        }

        return false;
    }

    async preRequestGuard(accessToken?: string) {
        if (process.browser) {
            accessToken = Cookies.get("tokens.accessToken");
        }

        if (!this.isTokenValid(accessToken)) {
            const newAccessToken = await this.refreshAccessToken();
            return newAccessToken;
        }
    }

    async refreshAccessToken(ctx?: NextPageContext) {
        // Store NextPageContext for page component getInitialProps using API request
        if (ctx && ctx.req) {
            this.ctx = ctx;
        }
        ctx = this.ctx || ctx;

        const refreshToken = Cookies.get("tokens.refreshToken", ctx);

        if (!this.isTokenValid(refreshToken)) {
            throw new Error("No refresh token found or it has expired");
        }

        try {
            const headers = { authorization: "Bearer " + refreshToken };
            const newTokenReq = await axiosRefresh.get(API_ROUTES.Auth.refresh, { headers });
            this.setAccessToken(newTokenReq.data.accessToken, ctx);

            return newTokenReq.data.accessToken;
        } catch (error) {
            throw new Error("Could not get a fresh access token.");
        }
    }

    setAccessToken(accessToken: string, ctx?: NextPageContext) {
        Cookies.set("tokens.accessToken", accessToken, "1 day", ctx);
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
    }

    login(result: LoginArgs) {
        this.storeCurrentUser(result);
        Router.push(loginPath);
    }

    logout(ctx?: NextPageContext) {
        Cookies.remove("tokens", ctx);
        Cookies.remove("user", ctx);

        if (!ctx) {
            Router.push(loginPath);
        }
    }

    revokeRefreshToken() {
        const refreshToken = Cookies.get("tokens.refreshToken");
        const headers = { authorization: "Bearer " + refreshToken };

        // Don't wait for logout req to end, user doesn't care
        axiosRefresh.get(API_ROUTES.Auth.logout, { headers });
    }
}

export const Auth = new AuthManager();
