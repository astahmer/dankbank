import { Router, useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

import { AuthAccess } from "@/services/AuthManager";

function useRouteHistory() {
    const router = useRouter();
    const [history, setHistory] = useState([router.route]);

    const currentRoute = history[history.length - 1];
    const pushUrl = (url: string) => setHistory(history.concat(url));

    // Go to previousRoute & remove it from history
    const goBack = () => {
        if (history[history.length - 2]) {
            router.push(history[history.length - 2]);
            setHistory(history.slice(0, -2));
        }
    };

    const reset = () => setHistory([]);

    // Add route to history on change
    useEffect(() => {
        Router.events.on("routeChangeComplete", pushUrl);

        return () => {
            Router.events.off("routeChangeComplete", pushUrl);
        };
    }, [history, pushUrl]);

    return [history, { currentRoute, pushUrl, goBack, reset }] as const;
}

export function RouteHistoryProvider({ children, routeAccess }: ChildrenProp & { routeAccess: AuthAccess }) {
    const [history, { currentRoute, pushUrl, goBack, reset }] = useRouteHistory();

    return (
        <HistoryContext.Provider value={{ history, currentRoute, routeAccess, pushUrl, goBack, reset }}>
            {children}
        </HistoryContext.Provider>
    );
}

export const HistoryContext = createContext<HistoryContextProps>({
    history: [],
    currentRoute: "",
    routeAccess: undefined,
    pushUrl: undefined,
    goBack: undefined,
    reset: undefined,
});

type UseRouteHistoryReturn = ReturnType<typeof useRouteHistory>;

export type HistoryContextProps = {
    history: UseRouteHistoryReturn[0];
    currentRoute: UseRouteHistoryReturn[1]["currentRoute"];
    routeAccess: AuthAccess;
    pushUrl: UseRouteHistoryReturn[1]["pushUrl"];
    goBack: UseRouteHistoryReturn[1]["goBack"];
    reset: UseRouteHistoryReturn[1]["reset"];
};
