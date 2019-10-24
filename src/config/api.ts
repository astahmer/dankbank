import axios from "axios";
import getConfig from "next/config";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const clientApiUrl = publicRuntimeConfig.API_URL;
export const baseURL = process.browser ? publicRuntimeConfig.API_URL : serverRuntimeConfig.API_URL;
export const axiosInstance = axios.create({ baseURL, timeout: 5000 });

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
};
