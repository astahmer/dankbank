import axios from "axios";

export const baseURL = process.env.API_URL;

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
    Meme: {
        baseRoute: "/memes/",
        isInAnyBank: "/isInAnyBank",
    },
    MemeBank: {
        baseRoute: "/banks/",
    },
};
