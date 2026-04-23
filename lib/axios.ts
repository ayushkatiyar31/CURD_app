import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("X-App-Client", "next-jsonplaceholder-crud");
    console.info(`[api] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error("[api] request error", error.message);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message;
    console.error(`[api] response error${status ? ` ${status}` : ""}: ${message}`);
    return Promise.reject(error);
  },
);
