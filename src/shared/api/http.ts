import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/shared/config";

const ACCESS_TOKEN_KEY = "dobry-shkaf-access-token";
const REFRESH_TOKEN_KEY = "dobry-shkaf-refresh-token";
const USER_KEY = "dobry-shkaf-user";

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    city: string | null;
    about: string | null;
    avatar_url: string | null;
    system_role: string;
    created_at: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
};

let refreshPromise: Promise<string> | null = null;

function isAuthEndpoint(url?: string): boolean {
  return Boolean(
    url &&
      /\/api\/v1\/auth\/(login|register|refresh|logout)(\/|$)/.test(url),
  );
}

function clearStoredSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
}

function redirectToLogin(): void {
  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (window.location.pathname !== "/login") {
    window.location.assign(`/login?from=${encodeURIComponent(currentPath)}`);
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("Отсутствует refresh token.");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(
        "/api/v1/auth/refresh",
        { refresh_token: refreshToken },
        {
          baseURL: env.apiUrl,
          timeout: 15000,
        },
      )
      .then(({ data }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refresh_token);
        return data.tokens.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !isAuthEndpoint(config.url)) {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      typeof window === "undefined" ||
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      if (accessToken || refreshToken) {
        clearStoredSession();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return http(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);
