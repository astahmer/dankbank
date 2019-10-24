import { Reducer, useCallback, useEffect, useReducer } from "react";

import { useLoading } from "./useLoading";

type useAsyncProps<Data = any, Props = any> = {
    actionFn: (actionProps?: Props) => Promise<Data>;
    actionProps?: Props;
    onMount: boolean;
    initialData?: Data;
    loadingMinDuration?: number;
};

export function useAsync<Data = any, Props = any>({
    actionFn,
    actionProps,
    onMount,
    initialData,
    loadingMinDuration = 100,
}: useAsyncProps<Data, Props>): [AsyncState<Data>, AsyncRunFn<Data, Props>] {
    const [state, dispatch] = useReducer(reducer, { data: initialData, isLoading: false, error: null });
    const shouldDisplayLoading = useLoading(state.isLoading, loadingMinDuration);

    const setLoading = (isLoading: boolean) => dispatch({ type: AsyncActionType.SET_LOADING, isLoading });
    const setData = (data: Data) => dispatch({ type: AsyncActionType.SET_DATA, data });
    const setError = (error: string) => dispatch({ type: AsyncActionType.SET_ERROR, error });

    const run: AsyncRunFn<Data, Props> = useCallback(
        async (runProps: Props) => {
            setLoading(true);
            try {
                const data = await actionFn(runProps);
                setData(data);

                return [null, data];
            } catch (error) {
                setError(error.message);
                return [error];
            }
        },
        [actionFn, actionProps]
    );

    useEffect(() => {
        let didCancel = false;

        async function asyncFn() {
            setLoading(true);

            try {
                const data = await actionFn(actionProps);
                if (!didCancel) {
                    setData(data);
                }
            } catch (error) {
                if (!didCancel) {
                    setError(error);
                }
            }
        }

        if (onMount) {
            asyncFn();
        }

        return () => {
            didCancel = true;
        };
    }, []);

    return [{ ...state, isLoading: shouldDisplayLoading }, run];
}

const reducer: Reducer<AsyncState, AsyncActionPayload> = (state, action) => {
    const { type, data, isLoading, error } = action;
    switch (type) {
        case AsyncActionType.SET_LOADING:
            return { ...state, isLoading };

        case AsyncActionType.SET_DATA:
            return { data, isLoading: false, error: null };

        case AsyncActionType.SET_ERROR:
            return { data: null, isLoading: false, error };
    }
};

enum AsyncActionType {
    SET_LOADING,
    SET_DATA,
    SET_ERROR,
}
type AsyncActionPayload = { type: AsyncActionType } & Optional<AsyncState>;
export type AsyncState<Data = any> = { data: Data; isLoading: boolean; error: string };
export type AsyncRunReturn<Data = any> = Promise<[Error, Data?]>;
export type AsyncRunFn<Data = any, Props = any> = (asyncProps?: Props) => AsyncRunReturn<Data>;
