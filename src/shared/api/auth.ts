
import axios from "axios";
import { http } from "./http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  city: string | null;
  about: string | null;
  avatar_url: string | null;
  system_role: string;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  personal_data_consent: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>(
    "/api/v1/auth/register",
    data,
  );

  return response.data;
}

export async function loginUser(
  data: LoginRequest,
): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>(
    "/api/v1/auth/login",
    data,
  );

  return response.data;
}

export async function getCurrentUser(
  accessToken: string,
): Promise<AuthUser> {
  const response = await http.get<AuthUser>("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function logoutUser(
  refreshToken: string,
): Promise<void> {
  await http.post("/api/v1/auth/logout", {
    refresh_token: refreshToken,
  });
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: { msg?: string }) => item.msg)
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) {
        return messages.join(". ");
      }
    }

    if (error.response?.status === 401) {
      return "Неверная почта или пароль.";
    }

    if (error.response?.status === 409) {
      return "Пользователь с такой почтой уже зарегистрирован.";
    }

    if (!error.response) {
      return "Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.";
    }

    return "Не удалось выполнить запрос. Попробуйте ещё раз.";
  }

  return "Произошла ошибка. Попробуйте ещё раз.";
}
