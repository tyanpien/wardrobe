import axios from "axios";
import { env } from "@/shared/config";

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
