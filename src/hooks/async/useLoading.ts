import { useEffect, useState } from "react";

/**
 * Returns true when at least [minDuration] has passed & isLoading is still true
 * @param isLoading
 * @param minDuration
 */
export function useLoading(isLoading: boolean, minDuration: number = 250) {
    const [timer, setTimer] = useState();
    const [shouldDisplayLoading, setShouldDisplayLoading] = useState(minDuration ? false : true);

    useEffect(() => {
        if (!minDuration) return;
        let didCancel = false;

        if (isLoading) {
            setTimer(
                setTimeout(() => {
                    if (isLoading && !didCancel) {
                        setShouldDisplayLoading(true);
                    }
                }, minDuration)
            );
        } else {
            clearTimeout(timer);
        }

        return () => {
            didCancel = true;
            clearTimeout(timer);
        };
    }, [isLoading]);

    return isLoading && shouldDisplayLoading;
}
