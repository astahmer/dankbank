import { createContext, Reducer, useContext, useEffect, useReducer } from "react";

import { Auth, JwtPayload } from "@/services/AuthManager";
import { Cookies } from "@/services/CookieManager";
import { Memory } from "@/services/MemoryManager";

import { HistoryContext } from "./useRouteHistory";

export type Tokens = { accessToken: string; refreshToken: string };
export const AuthContext = createContext<AuthContext>({
    accessToken: "",
    user: null,
    isTokenValid: null,
    actions: { login: undefined, refresh: undefined, logout: undefined },
});

function useAuth(serverCookies?: any, newAccessToken?: string): [AuthInitialState, AuthActions] {
    const accessToken = newAccessToken || Cookies.get("tokens.accessToken", serverCookies);

    // Auth State
    const [state, dispatch] = useReducer(reducer, {
        accessToken,
        user: Auth.parseToken(accessToken),
        isTokenValid: Auth.isTokenValid(accessToken),
    });

    // Whenever we get a new accessToken, refresh AuthContext
    useEffect(() => {
        refresh(accessToken);
    }, [accessToken]);

    // Auth Actions
    const login: AuthActions["login"] = (accessToken, refreshToken) => {
        const user = Auth.parseToken(accessToken);
        Auth.login({ accessToken, refreshToken, user });
        dispatch({ type: AuthActionType.LOGIN, accessToken, user });
    };
    const refresh = (accessToken: string) => dispatch({ type: AuthActionType.REFRESH, accessToken });
    const logout = (isTrigger: boolean) => {
        if (!isTrigger) {
            Memory.set("logout", Date.now());
        }

        Memory.remove("user");
        Auth.revokeRefreshToken();
        Auth.logout();
        dispatch({ type: AuthActionType.LOGOUT });
    };

    const syncLogout = (event: StorageEvent) => {
        if (event.key === "logout") {
            logout(true);
        }
    };

    // Reset route history on login/logout
    const { reset } = useContext(HistoryContext);
    // TODO auto Logout at refreshToken expireAt
    useEffect(() => {
        window.addEventListener("storage", syncLogout);
        reset();

        return () => {
            window.removeEventListener("storage", syncLogout);
        };
    }, [state.isTokenValid]);

    return [state, { login, refresh, logout }];
}

export function AuthProvider({
    children,
    serverCookies,
    newAccessToken,
}: ChildrenProp & { serverCookies: any; newAccessToken?: string }) {
    const [state, actions] = useAuth(serverCookies, newAccessToken);

    return <AuthContext.Provider value={{ ...state, actions }}>{children}</AuthContext.Provider>;
}

const reducer: Reducer<AuthInitialState, AuthActionPayload> = (state, action) => {
    const { type, accessToken, user } = action;
    switch (type) {
        case AuthActionType.LOGIN:
            return { accessToken, user, isTokenValid: Auth.isTokenValid(accessToken) };

        case AuthActionType.REFRESH:
            return { accessToken, user: Auth.parseToken(accessToken), isTokenValid: Auth.isTokenValid(accessToken) };

        case AuthActionType.LOGOUT:
            return { accessToken: undefined, user: null, isTokenValid: false };
    }
};

type AuthContext = AuthInitialState & { actions: AuthActions };
type AuthActions = {
    login: (accessToken: string, refreshToken: string) => void;
    refresh: (accessToken: string) => void;
    logout: (isTrigger?: boolean) => void;
};

enum AuthActionType {
    LOGIN,
    LOGOUT,
    REFRESH,
}
type AuthActionPayload = { type: AuthActionType; accessToken?: string; user?: JwtPayload };
type AuthInitialState = { accessToken: string; user: JwtPayload; isTokenValid: boolean };
