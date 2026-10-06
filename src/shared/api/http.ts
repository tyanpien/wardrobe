import axios from "axios";
import { env } from "@/shared/config";

export const http = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    return Promise.reject(error);
  },
);
