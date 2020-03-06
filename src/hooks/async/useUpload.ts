import { AxiosRequestConfig } from "axios";
import { Reducer, useEffect, useReducer, useRef } from "react";

import { CancelToken } from "@/config/api";
import { getRandomString, makeFormData } from "@/functions/utils";

import { useRequestAPI } from "./useAPI";
import { UseAsyncOptions, UseAsyncState } from "./useAsync";

export type UseUploadOptions = {
    fieldKey?: string;
    useChunks?: boolean;
    chunkSize?: number;
    maxActiveRequests?: number;
    maxRetriesOnError?: number;
    config?: AxiosRequestConfig;
};

export const defaultUploadOptions = { chunkSize: 25, maxActiveRequests: 4, maxRetriesOnError: 4 };

type StartUpload = (currentFile: File, options?: UseUploadOptions) => void;
type CancelUpload = () => void;

export function useUpload<Result = any>(
    url: string,
    file: File,
    options: UseUploadOptions,
    asyncOptions?: UseAsyncOptions
): [UseAsyncState<Result>, StartUpload, UseUploadState<Result>, CancelUpload] {
    const { fieldKey, useChunks, chunkSize, maxActiveRequests, maxRetriesOnError, config } = {
        ...defaultUploadOptions,
        ...options,
    };
    const { onMount, onTrigger, initialData } = asyncOptions || {};

    const [state, dispatch] = useReducer(reducer, initialState);
    const didUnmount = useRef(false);

    // Actions
    const initUpload = (currentFile: File, chunkSize?: number) =>
        dispatch({ type: Actions.INIT_UPLOAD, currentFile, chunkSize });
    const cancelUpload = () => dispatch({ type: Actions.CANCEL_UPLOAD });
    const setCompleteChunk = (completeChunk: UseAsyncState) =>
        dispatch({ type: Actions.SET_COMPLETE_CHUNK, completeChunk });
    const setComplete = (isComplete: boolean) => dispatch({ type: Actions.SET_COMPLETE, isComplete });

    const restartChunk = (chunkId: number) => dispatch({ type: Actions.RESTART_CHUNK, chunkId });
    const updateErrorCount = (shouldResetErrorCount?: boolean) =>
        dispatch({ type: Actions.SET_ERROR_COUNT, shouldResetErrorCount });

    const updateActiveRequestCount = (operation: Operation) =>
        dispatch({ type: Actions.UPDATE_ACTIVE_REQUEST_COUNT, operation });
    const setProgress = (progress: number, chunkId?: number) =>
        dispatch({ type: Actions.SET_PROGRESS, progress, chunkId });
    const makeUploadProgressListener = (chunkId: number) => (event: ProgressEvent) => {
        setProgress(Math.round((event.loaded * 100) / event.total), chunkId);
    };

    // Wrapper
    const startUpload = (file: File) => {
        setComplete(false);
        initUpload(file, useChunks ? chunkSize : null);
    };

    const cancelSource = useRef(CancelToken.source());
    const [async, run] = useRequestAPI(
        url,
        {
            ...config,
            method: "post",
            cancelToken: cancelSource.current.token,
        },
        { withToken: false },
        { initialData }
    );
    const cancel = () => {
        setComplete(true);
        cancelUpload();
        if (cancelSource.current) {
            cancelSource.current.cancel("Cancelled upload");
            cancelSource.current = CancelToken.source();
        }
    };

    // Cancel req on unmount
    useEffect(() => {
        didUnmount.current = false;
        return () => {
            cancel();
            didUnmount.current = true;
        };
    }, []);

    // On passed file change, set state current file
    useEffect(() => {
        if (onMount || onTrigger) {
            startUpload(file);
        }
    }, [file, onTrigger]);

    useEffect(() => {
        if (state.currentFile) {
            makeUploadRequest();
        }
    }, [state.currentFile]);

    // On current file change, start upload
    // or try to send the next chunk
    // or set complete if there are no chunks left / if request is done
    useEffect(() => {
        if (state.isComplete || !state.currentFile || state.wasCanceled || state.activeRequests >= maxActiveRequests) {
            return;
        }

        if (state.errorCount >= maxRetriesOnError) {
            cancel();
            return;
        }

        const shouldRetry = async.error && state.errorCount < maxRetriesOnError;
        const canMakeAnotherRequest =
            (!useChunks && async.isDone && shouldRetry) || (useChunks && state.chunksQueue.length);
        if (canMakeAnotherRequest) {
            makeUploadRequest();
        }
    }, [
        state.isComplete,
        !state.currentFile,
        state.wasCanceled,
        state.activeRequests,
        state.errorCount,
        async.error,
        async.isDone,
    ]);

    const makeUploadRequest = async () => {
        // Get upload config for either a single classic multipart/form-data or a chunked octet-stream
        const configArg = useChunks ? { ...state, chunkSize } : fieldKey;
        const [data, config, chunkId] = getUploadConfig(state.currentFile, configArg);

        if (useChunks) {
            updateActiveRequestCount(Operation.INCREMENT);
        }

        // Make request
        const [err, result] = await run(data, { ...config, onUploadProgress: makeUploadProgressListener(chunkId) });

        if (didUnmount.current) {
            return;
        }

        if (result) {
            if (useChunks) {
                setCompleteChunk({ ...async, error: err, data: result });
            } else {
                setComplete(true);
                return;
            }
        }

        if (err) {
            // Restart chunk if there was an error
            if (useChunks) {
                restartChunk(chunkId);
            } else {
                updateErrorCount();
            }
        } else {
            updateErrorCount(true);
        }

        if (useChunks) {
            updateActiveRequestCount(Operation.DECREMENT);
        }
    };

    return [async, startUpload, state, cancel];
}

const getOctetsFromKb = (kb: number) => kb * 1024;
const getChunksTotal = (fileSize: number, chunkSize: number) => Math.ceil(fileSize / getOctetsFromKb(chunkSize));
const getChunksQueue = (chunkTotal: number) =>
    new Array(chunkTotal)
        .fill(null)
        .map((_, index) => index)
        .reverse();

type ChunkData = {
    fileIdentifier: string;
    chunksQueue: number[];
    chunkSize: number;
    chunksTotal: number;
};

function getUploadConfig(
    file: File,
    fieldKeyOrChunkData: string | ChunkData
): [FormData | Blob, AxiosRequestConfig, number?] {
    let data;
    let chunkId;
    let config;

    if (typeof fieldKeyOrChunkData === "string") {
        data = makeFormData({ [fieldKeyOrChunkData]: file });
    } else if (fieldKeyOrChunkData) {
        chunkId = fieldKeyOrChunkData.chunksQueue.pop();

        const octets = getOctetsFromKb(fieldKeyOrChunkData.chunkSize);
        const begin = chunkId * octets;
        data = file.slice(begin, begin + octets);

        config = {
            headers: {
                "Content-Type": "application/octet-stream",
                "X-Chunk-Id": chunkId,
                "X-Chunks-Total": fieldKeyOrChunkData.chunksTotal,
                "X-Content-Id": fieldKeyOrChunkData.fileIdentifier,
                "X-Content-Length": file.size,
                "X-Content-Name": encodeURIComponent(file.name),
            },
        };
    }

    return [data, config, chunkId];
}

enum Actions {
    INIT_UPLOAD,
    UPDATE_ACTIVE_REQUEST_COUNT,
    SET_PROGRESS,
    RESTART_CHUNK,
    SET_ERROR_COUNT,
    CANCEL_UPLOAD,
    SET_COMPLETE,
    SET_COMPLETE_CHUNK,
}

type UseUploadState<Result = any> = {
    currentFile: File;
    wasCanceled: boolean;
    errorCount: number;
    fileProgress: number;
    isComplete: boolean;
    // Chunks
    activeRequests: number;
    chunkProgress: Record<number, number>;
    chunksTotal: number;
    chunksQueue: number[];
    fileIdentifier: string;
    completeChunks: UseAsyncState<Result>[];
};
enum Operation {
    INCREMENT,
    DECREMENT,
}
type Payload = {
    type: Actions;
    currentFile?: File;
    shouldResetErrorCount?: boolean;
    progress?: number;
    chunkSize?: number;
    operation?: Operation;
    chunkId?: number;
    isComplete?: boolean;
    completeChunk?: UseAsyncState;
};

const reducer: Reducer<UseUploadState, Payload> = (state, action) => {
    const {
        type,
        currentFile,
        shouldResetErrorCount,
        operation,
        progress,
        chunkSize,
        chunkId,
        isComplete,
        completeChunk,
    } = action;
    switch (type) {
        case Actions.INIT_UPLOAD:
            if (!currentFile) {
                return initialState;
            }

            if (chunkSize) {
                const chunksTotal = getChunksTotal(currentFile.size, chunkSize);
                return {
                    ...initialState,
                    chunksTotal,
                    chunksQueue: getChunksQueue(chunksTotal),
                    fileIdentifier: getRandomString(),
                    currentFile,
                };
            } else {
                return {
                    ...initialState,
                    currentFile,
                };
            }

        case Actions.RESTART_CHUNK:
            return { ...state, chunksQueue: state.chunksQueue.concat(chunkId), errorCount: state.errorCount + 1 };

        case Actions.UPDATE_ACTIVE_REQUEST_COUNT:
            return { ...state, activeRequests: state.activeRequests + (operation === Operation.INCREMENT ? 1 : -1) };

        case Actions.SET_ERROR_COUNT:
            return { ...state, errorCount: shouldResetErrorCount ? 0 : state.errorCount + 1 };

        case Actions.SET_PROGRESS:
            if (chunkId !== undefined) {
                const chunkProgress = { ...state.chunkProgress, [chunkId]: progress };
                return {
                    ...state,
                    chunkProgress,
                    fileProgress: getTotalProgress(chunkProgress, state.chunksTotal),
                };
            } else {
                return { ...state, fileProgress: progress };
            }

        case Actions.CANCEL_UPLOAD:
            return { ...state, wasCanceled: true };

        case Actions.SET_COMPLETE_CHUNK: {
            const isComplete = state.completeChunks.length + 1 === state.chunksTotal;
            return { ...state, completeChunks: state.completeChunks.concat(completeChunk), isComplete };
        }

        case Actions.SET_COMPLETE:
            return { ...state, isComplete };
    }
};

const initialState: UseUploadState = {
    currentFile: undefined,
    wasCanceled: false,
    errorCount: 0,
    fileProgress: undefined,
    isComplete: false,
    // Chunks
    activeRequests: 0,
    chunksTotal: undefined,
    chunksQueue: [],
    chunkProgress: {},
    fileIdentifier: undefined,
    completeChunks: [],
};

export function getTotalProgress(record: Record<number, number>, totalParts: number) {
    let currentProgress = 0;
    for (const key in record) {
        if (record.hasOwnProperty(key)) {
            currentProgress += record[key];
        }
    }

    return currentProgress / totalParts;
}
