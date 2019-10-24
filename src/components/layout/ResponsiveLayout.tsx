import getIsMobileResult, { isMobileResult } from "ismobilejs";
import { ReactNode, useContext } from "react";

import { useWindowSize } from "@/functions/hooks/dom/useWindowSize";
import { ServerReqContext } from "@/pages/_app";

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

export function useResponsive(deviceToCheck?: string) {
    let width;

    if (process.browser) {
        const sizes = useWindowSize();
        width = sizes.width;
    }

    const { userAgent } = useContext(ServerReqContext);
    const isMobileResult = getIsMobileResult(userAgent);

    const device = width ? getDeviceByWidth(width) : getDeviceByMobileResult(isMobileResult);
    const isDevice = device === deviceToCheck;
    const isMobile = ["smallPhone", "phone", "tablet"].includes(device);

    return { device, isDevice, width, isMobile };
}

export const ResponsiveLayout = ({ children, device }: { children: ReactNode; device: string }) => {
    const { isDevice } = useResponsive(device);
    return isDevice ? children : null;
};
