import ms from "ms";
import { NextPageContext } from "next";

import { getProp, ObjectFromEntries, setProp } from "@/functions/utils";

const earliestDate = new Date(0);
class CookiesManager {
    getAll(ctx?: NextPageContext) {
        if (getProp(ctx, "req.headers.cookie")) {
            return this.parse(ctx.req.headers.cookie);
        } else if (process.browser) {
            return this.parse(document.cookie);
        } else {
            return {};
        }
    }

    get(key: string, ctxOrCookies?: NextPageContext | Record<string, string>) {
        let cookies;
        if (process.browser) {
            cookies = this.getAll();
        } else {
            cookies =
                ctxOrCookies && !("AppTree" in ctxOrCookies)
                    ? ctxOrCookies
                    : this.getAll(ctxOrCookies as NextPageContext);
        }

        const path = key.split(".");
        let rawData;
        try {
            rawData = JSON.parse(cookies[path[0]]);
        } catch (error) {
            rawData = cookies[path[0]] || {};
        }

        const data = path.length > 1 ? getProp(rawData, path.slice(1).join(".")) : rawData;
        return data;
    }

    set(key: string, value: any, duration: string | number, ctx?: NextPageContext) {
        duration = typeof duration === "string" ? Date.now() + ms(duration) : duration;

        const path = key.split(".");
        let data = this.get(path[0], ctx) || {};

        if (path.length > 1) {
            setProp(data, path.slice(1), value);
        } else {
            data = value;
        }

        const updatedData = typeof data === "object" ? JSON.stringify(data) : data;
        const cookie = `${path[0]}=${updatedData};expires=${new Date(duration)};path=/`;

        if (ctx && ctx.res) {
            this.serverSetCookie(cookie, ctx);
        } else {
            document.cookie = cookie;
        }
    }

    remove(key: string, ctx?: NextPageContext) {
        const expiredCookie = `${key}=;expires=${earliestDate};path=/`;

        if (ctx && ctx.res) {
            this.serverSetCookie(expiredCookie, ctx);
        } else {
            document.cookie = expiredCookie;
        }
    }

    private parse(cookies: string) {
        return ObjectFromEntries(cookies.split("; ").map((x) => x.split("=")));
    }

    private serverSetCookie(cookie: string, ctx: NextPageContext) {
        // Cannot set headers after they are sent to the client
        if (ctx.res.headersSent) {
            return;
        }

        const currentHeader = (ctx.res.getHeader("Set-Cookie") as string[]) || [];
        ctx.res.setHeader("Set-Cookie", currentHeader.concat(cookie));
    }
}

export const Cookies = new CookiesManager();
