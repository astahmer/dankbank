import { Reducer, useCallback, useEffect, useReducer, useRef } from "react";

import { getRandomString } from "@/functions/utils";

import { useLoading } from "./useLoading";

export function useAsync<Data = any, Props = any>({
    actionFn,
    actionProps,
    onMount,
    onTrigger,
    initialData,
    loadingMinDuration = 100,
}: UseAsyncProps<Data, Props>): [UseAsyncState<Data>, AsyncRunFn<Data, Props>, AsyncReset] {
    const [state, dispatch] = useReducer(reducer, initialState(initialData));
    const shouldDisplayLoading = useLoading(state.isLoading, loadingMinDuration);

    const setLoading = useCallback(() => dispatch({ type: AsyncActionType.SET_LOADING, initialData }), []);
    const setData = useCallback((data: Data) => dispatch({ type: AsyncActionType.SET_DATA, initialData, data }), []);
    const setError = useCallback(
        (error: string) => dispatch({ type: AsyncActionType.SET_ERROR, initialData, error }),
        []
    );
    const reset = useCallback(() => dispatch({ type: AsyncActionType.RESET, initialData }), []);

    const didUnmount = useRef(false);

    const run: AsyncRunFn<Data, Props> = useCallback(
        async (runProps: Props, ...args) => {
            setLoading();
            try {
                const data = await actionFn(runProps, ...args);
                if (!didUnmount.current) {
                    setData(data);
                }

                return [null, data];
            } catch (error) {
                if (!didUnmount.current) {
                    setError(error);
                }
                return [error];
            }
        },
        [actionFn, actionProps]
    );

    useEffect(() => {
        didUnmount.current = false;

        if (onMount || onTrigger) {
            run(actionProps);
        }

        return () => {
            didUnmount.current = true;
        };
    }, [onTrigger]);

    return [{ ...state, shouldDisplayLoading }, run, reset];
}

const initialState = (initialData: any): AsyncState => ({
    data: initialData,
    isLoading: false,
    error: null,
    isDone: false,
    identifier: null,
});

const reducer: Reducer<AsyncState, AsyncActionPayload> = (state, action) => {
    const { type, data, error, initialData } = action;
    switch (type) {
        case AsyncActionType.SET_LOADING:
            return { data: initialData, isLoading: true, error: null, isDone: false, identifier: getRandomString() };

        case AsyncActionType.SET_DATA:
            return { data, isLoading: false, error: null, isDone: true, identifier: state.identifier };

        case AsyncActionType.SET_ERROR:
            return { data: initialData, isLoading: false, error, isDone: true, identifier: state.identifier };

        case AsyncActionType.RESET:
            return initialState(initialData);
    }
};

enum AsyncActionType {
    SET_LOADING,
    SET_DATA,
    SET_ERROR,
    RESET,
}
type AsyncActionPayload = { type: AsyncActionType; initialData: any } & Optional<AsyncState>;
export type AsyncState<Data = any> = {
    data: Data;
    isLoading: boolean;
    error: string | Error;
    isDone: boolean;
    identifier: string;
};
export type AsyncRunReturn<Data = any> = Promise<[Error, Data?]>;
export type AsyncRunFn<Data = any, Props = any, Args = any> = (
    asyncProps?: Props,
    ...args: Args[]
) => AsyncRunReturn<Data>;
export type AsyncReset = () => void;

export type UseAsyncOptions<Data = any> = {
    onMount?: boolean;
    onTrigger?: any;
    initialData?: Data;
    loadingMinDuration?: number;
};

type UseAsyncProps<Data = any, Props = any, Args = any> = {
    actionFn: (actionProps?: Props, ...args: Args[]) => Promise<Data>;
    actionProps?: Props;
} & UseAsyncOptions<Data>;

export type UseAsyncState<Data = any> = AsyncState<Data> & { shouldDisplayLoading: boolean };
