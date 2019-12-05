import axios from "axios";
import getConfig from "next/config";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const clientApiUrl = publicRuntimeConfig.API_URL;
// export const baseURL = process.browser ? publicRuntimeConfig.API_URL : serverRuntimeConfig.API_URL;
// export const baseURL = "http://192.168.1.22:3000";
export const baseURL = "http://192.168.1.111:3000";
export const axiosInstance = axios.create({ baseURL, timeout: 10000 });
export const CancelToken = axios.CancelToken;

export const API_ROUTES = {
    Auth: {
        register: "/users",
        login: "/auth/login",
        refresh: "/auth/refresh",
        logout: "/auth/logout",
        twitter: "/auth/twitter",
    },
    Search: {
        tag: "/tags/search",
        memes: "/memes/search",
    },
    Upload: {
        img: "/images/upload/",
        crop: "/images/upload/crop",
        chunks: "/images/upload/chunk",
    },
};
