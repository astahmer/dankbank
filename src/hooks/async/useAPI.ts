import { AxiosRequestConfig, Canceler } from "axios";
import { useContext, useRef } from "react";

import { CancelToken } from "@/config/api";
import { future, isType } from "@/functions/utils";
import { API, Auth } from "@/services";

import { AsyncReset, AsyncRunFn, useAsync, UseAsyncOptions, UseAsyncState } from "./useAsync";
import { AuthContext } from "./useAuth";

type UseAPIOptions = { withToken?: boolean };

export function useAPI<Data = any, Props = any>(
    url: string,
    asyncOptions: UseAsyncOptions<Data>
): [UseAsyncState<Data>, AsyncRunFn<Data, Props, AxiosRequestConfig>, AsyncReset, Canceler];
export function useAPI<Data = any, Props = any>(
    url: string,
    values?: Props,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
): [UseAsyncState<Data>, AsyncRunFn<Data, Props, AxiosRequestConfig>, AsyncReset, Canceler];
export function useAPI<Data = any, Props = any>(
    url: string,
    valuesOrAsyncOptions?: Props | UseAsyncOptions<Data>,
    config?: AxiosRequestConfig,
    options?: UseAPIOptions,
    asyncOptions?: UseAsyncOptions<Data>
): [UseAsyncState<Data>, AsyncRunFn<Data, Props, AxiosRequestConfig>, AsyncReset, Canceler] {
    const { withToken } = options || {};

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
            } else {
                refresh(accessToken);
            }
        }
        return API[method](url, props, { cancelToken, ...config, ...overrideConfig });
    };

    // TODO make useMountAPI = useAPI(url, {onMount: true}) instead
    const isSecondArgAsyncOptions = isAsyncOptions(valuesOrAsyncOptions);
    const values = !isType<UseAsyncOptions>(valuesOrAsyncOptions, isSecondArgAsyncOptions)
        ? valuesOrAsyncOptions
        : null;
    asyncOptions = isType<UseAsyncOptions>(valuesOrAsyncOptions, isSecondArgAsyncOptions)
        ? valuesOrAsyncOptions
        : asyncOptions;

    const actionProps = values || (config ? config.data || config.params : null);
    const [async, run, reset] = useAsync({ actionFn, actionProps, ...asyncOptions });

    return [async, run, reset, cancelRef.current];
}

const asyncOptionsKeys = ["onMount", "onTrigger", "initialData", "loadingMinDuration"];
const isAsyncOptions = (prop: any) => prop && Object.keys(prop).some((key) => asyncOptionsKeys.includes(key));
