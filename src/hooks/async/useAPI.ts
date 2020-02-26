import { AxiosRequestConfig, Canceler } from "axios";
import { useContext, useRef } from "react";

import { CancelToken } from "@/config/api";
import { future } from "@/functions/utils";
import { API, Auth } from "@/services";

import { AsyncReset, AsyncRunReturn, useAsync, UseAsyncOptions, UseAsyncState } from "./useAsync";
import { AuthContext } from "./useAuth";

type UseAPIOptions = { withToken?: boolean };
export type ApiRunFn<Data = any, Props = any> = (
    props: Props,
    overrideConfig?: AxiosRequestConfig
) => AsyncRunReturn<Data>;

export function useAPI<Data = any, Props = any>(
    url: string,
    values?: Props,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
): [UseAsyncState<Data>, ApiRunFn<Data, Props>, AsyncReset, Canceler] {
    const { withToken = true } = options || {};

    const auth = useContext(AuthContext);
    const { refresh, logout } = auth.actions;

    const cancelRef = useRef(null);
    const method = config ? (config.method as "get" | "post") : "get";

    const actionFn = async (props: Props, overrideConfig?: AxiosRequestConfig) => {
        const cancelToken = new CancelToken((c) => (cancelRef.current = c));

        if (withToken) {
            const [err, accessToken] = await future(Auth.preRequestGuard());
            if (err) {
                logout();
                throw err;
            } else if (accessToken) {
                refresh(accessToken);
            }
        }
        return API[method](url, props, { cancelToken, ...config, ...overrideConfig });
    };

    const actionProps = values || (config ? config.data || config.params : null);
    const [async, run, reset] = useAsync({ actionFn, actionProps, ...asyncOptions });

    return [async, run, reset, cancelRef.current];
}

export function useRequestAPI<Data = any>(
    url?: string,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
) {
    return useAPI(url, null, config, options, asyncOptions);
}

export function useInitialAPI<Data = any, Props = any>(
    url: string,
    values?: Props,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
) {
    return useAPI(url, values, config, options, { ...asyncOptions, ...{ onMount: true } });
}

export function useTriggerAPI<Data = any, Props = any>(
    url: string,
    trigger: any,
    values?: Props,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
) {
    return useAPI(url, values, config, options, { ...asyncOptions, ...{ onTrigger: trigger } });
}
