import { Router, useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export const HistoryContext = createContext({
    history: [],
    currentRoute: "",
    pushUrl: undefined,
    goBack: undefined,
    reset: undefined,
});

type RouteHistory = [
    string[],
    { currentRoute: string; pushUrl: (url: string) => void; goBack: () => void; reset: () => void }
];

function useRouteHistory(): RouteHistory {
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

    return [history, { currentRoute, pushUrl, goBack, reset }];
}

export function RouteHistoryProvider({ children }: ChildrenProp) {
    const [history, { currentRoute, pushUrl, goBack, reset }] = useRouteHistory();

    return (
        <HistoryContext.Provider value={{ history, currentRoute, pushUrl, goBack, reset }}>
            {children}
        </HistoryContext.Provider>
    );
}
