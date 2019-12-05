import { ReactNode } from "react";

import { useResponsive } from "@/hooks/dom/useResponsive";

export const ResponsiveLayout = ({ children, device }: { children: ReactNode; device: string }) => {
    const { isDevice } = useResponsive(device);
    return isDevice ? children : null;
};
