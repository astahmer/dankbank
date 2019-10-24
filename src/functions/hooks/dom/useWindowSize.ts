import { useEffect, useState } from "react";

export function useWindowSize() {
    const isClient = typeof window === "object";

    const getSize = () => ({
        width: isClient && window.innerWidth,
        height: isClient && window.innerHeight,
    });

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        if (!isClient) {
            return;
        }

        const handleResize = () => setWindowSize(getSize());
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}
