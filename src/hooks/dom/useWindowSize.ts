import { useState } from "react";

import { debounce, useEnhancedEffect } from "@/functions/utils";

const getSize = () => ({
    width: process.browser && window.innerWidth,
    height: process.browser && window.innerHeight,
});

export function useWindowSize() {
    const [windowSize, setWindowSize] = useState(getSize);

    useEnhancedEffect(() => {
        if (!process.browser) {
            return;
        }

        const handleResize = debounce(() => setWindowSize(getSize()), 100);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}
