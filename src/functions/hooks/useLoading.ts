import { useEffect, useState } from "react";

/**
 * Returns true when at least [minDuration] has passed & isLoading is still true
 * @param isLoading
 * @param minDuration
 */
export function useLoading(isLoading: boolean, minDuration: number = 250) {
    const [timer, setTimer] = useState();
    const [shouldDisplayLoading, setShouldDisplayLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setTimer(
                setTimeout(() => {
                    if (isLoading) {
                        setShouldDisplayLoading(true);
                    }
                }, minDuration)
            );
        } else {
            clearTimeout(timer);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isLoading]);

    return isLoading && shouldDisplayLoading;
}
