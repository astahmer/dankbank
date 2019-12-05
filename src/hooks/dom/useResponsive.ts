import getIsMobileResult, { isMobileResult } from "ismobilejs";
import { useContext } from "react";

import { ServerReqContext } from "@/pages/_app";

import { useWindowSize } from "./useWindowSize";

export function useResponsive(deviceToCheck?: string) {
    let width = 0;

    const sizes = useWindowSize();
    if (process.browser) {
        width = sizes.width;
    }

    const { userAgent } = useContext(ServerReqContext);
    const isMobileResult = getIsMobileResult(userAgent);

    const device = width ? getDeviceByWidth(width) : getDeviceByMobileResult(isMobileResult);
    const isDevice = device === deviceToCheck;
    const isMobile = ["smallPhone", "phone", "tablet"].includes(device);

    return { device, isDevice, width, height: sizes && sizes.height, isMobile };
}

const getDeviceByWidth = (width: number) => {
    for (const key in deviceMaxWidth) {
        if (deviceMaxWidth.hasOwnProperty(key) && width <= deviceMaxWidth[key]) {
            return key;
        }
    }
};

const getDeviceByMobileResult = (isMobileResult: isMobileResult) => {
    if (isMobileResult.phone) {
        return "phone";
    } else if (isMobileResult.tablet) {
        return "tablet";
    } else {
        return "desktop";
    }
};

const deviceMaxWidth: Record<string, number> = {
    smallPhone: 380,
    phone: 570,
    tablet: 768,
    medium: 980,
    desktop: 1280,
    large: 1680,
    wide: 1920,
};
