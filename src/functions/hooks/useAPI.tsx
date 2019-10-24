import { AxiosRequestConfig } from "axios";
import { useContext } from "react";

import { API } from "@/services/ApiManager";
import { Auth } from "@/services/AuthManager";

import { future } from "../utils";
import { AsyncRunFn, AsyncState, useAsync } from "./useAsync";
import { AuthContext } from "./useAuth";

type useAPIOptions = { withToken?: boolean; onMount: boolean };

export function useAPI<Data = any, Props = any>(
    url: string,
    values?: Props,
    config?: AxiosRequestConfig,
    options?: useAPIOptions
): [AsyncState<Data>, AsyncRunFn<Data, Props>] {
    const { withToken, onMount } = options || {};

    const auth = useContext(AuthContext);
    const { refresh, logout } = auth.actions;

    const method = config ? (config.method as "get" | "post") : "get";
    const actionFn = async (props: any) => {
        if (withToken) {
            const [err, accessToken] = await future(Auth.preRequestGuard());
            if (err) {
                logout();
                throw err;
            } else {
                refresh(accessToken);
            }
        }
        return API[method](url, props, config);
    };
    const actionProps = values || (config ? config.data || config.params : null);
    const [async, run] = useAsync({ actionFn, actionProps, onMount });

    return [async, run];
}
