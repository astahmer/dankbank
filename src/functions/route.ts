import { NextPageContext } from "next";
import Router from "next/router";

export const loginPath = "/auth";

export const redirectToPath = (routePath: string, ctx?: NextPageContext) => {
    if (process.browser) {
        Router.push(routePath);
    } else {
        ctx.res.writeHead(302, { Location: routePath });
        ctx.res.end();
    }
};

export const redirectToLogin = (ctx?: NextPageContext) => redirectToPath(loginPath, ctx);
export const redirectToHome = (ctx?: NextPageContext) => redirectToPath("/", ctx);
