import axios from "axios";
import getConfig from "next/config";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const baseURL = process.browser ? publicRuntimeConfig.API_URL : serverRuntimeConfig.API_URL;
export const API = axios.create({
    baseURL,
    timeout: 5000,
});
