import { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import { axiosInstance } from "@/config/api";
import { isDev } from "@/functions/utils";

class ApiManager {
    async request<T = any>(method: Method, url: string, config: AxiosRequestConfig) {
        try {
            // Get rid of /api/ from @id/iri
            config.url = (config.url || url || "").replace("/api/", "");

            const res: AxiosResponse<T> = await axiosInstance({ method, url, ...config });
            return res.data;
        } catch (error) {
            if (isDev) {
                console.error(error.message);
            }
            throw error;
        }
    }

    async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
        return this.request<T>("get", url, { params, ...config });
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.request<T>("post", url, { data, ...config });
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.request<T>("put", url, { data, ...config });
    }

    async delete<T = any>(url: string, data?: null, config?: AxiosRequestConfig) {
        return this.request<T>("delete", url, config);
    }
}

export const API = new ApiManager();
