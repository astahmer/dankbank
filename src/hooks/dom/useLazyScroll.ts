import { useEffect, useRef, useState } from "react";
import { IntersectionOptions, InViewHookResponse, useInView } from "react-intersection-observer";

export function useLazyScroll(props?: UseLazyScrollProps): [InViewHookResponse["0"], boolean, InViewHookResponse["2"]] {
    const options = { delay: 210, rootMargin: "200px 0px", ...props };
    const [ref, inView, entry] = useInView(options);

    const didUnmount = useRef(false);
    const inViewRef = useRef(inView);
    const [isVisible, setVisible] = useState(false);

    const inViewTimerRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        didUnmount.current = false;
        inViewRef.current = inView;

        if (inView && !isVisible) {
            clearTimeout(inViewTimerRef.current);
            inViewTimerRef.current = setTimeout(() => {
                if (inViewRef.current && !didUnmount.current) {
                    setVisible(true);
                }
            }, options.delay);
        }

        return () => (didUnmount.current = true);
    }, [inView]);

    return [ref, isVisible, entry];
}

export type UseLazyScrollProps = IntersectionOptions & { delay: number };
