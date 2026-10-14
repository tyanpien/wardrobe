import axios from "axios";
import { http } from "@/shared/api/http";
import { env } from "@/shared/config";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  city: string | null;
  about: string | null;
  avatar_url: string | null;
  items_saved: number;
  created_at: string;
};

type CitiesResponse = {
  cities: string[];
};

function getAuthConfig() {
  if (typeof window === "undefined") {
    throw new Error("Запрос профиля доступен только в браузере.");
  }

  const accessToken = localStorage.getItem("dobry-shkaf-access-token");

  if (!accessToken) {
    throw new Error("Необходимо войти в аккаунт.");
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await http.get<UserProfile>(
    "/api/v1/profile/me",
    getAuthConfig(),
  );

  return response.data;
}

export async function updateMyProfile(data: {
  name: string;
  city: string | null;
  about: string | null;
}): Promise<UserProfile> {
  const response = await http.patch<UserProfile>(
    "/api/v1/profile/me",
    data,
    getAuthConfig(),
  );

  return response.data;
}


export async function uploadMyAvatar(file: File): Promise<UserProfile> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("dobry-shkaf-access-token")
        : null;
  
    if (!token) {
      throw new Error("Необходимо авторизоваться");
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await http.post<UserProfile>(
      "/api/v1/profile/me/avatar",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  
    return response.data;
  }
  

export async function deleteMyAvatar(): Promise<UserProfile> {
  const response = await http.delete<UserProfile>(
    "/api/v1/profile/me/avatar",
    getAuthConfig(),
  );

  return response.data;
}

export async function getCities(): Promise<string[]> {
  const response = await http.get<CitiesResponse>("/api/v1/cities");

  return response.data.cities;
}

export function getAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) {
    return "";
  }

  if (
    avatarUrl.startsWith("http://") ||
    avatarUrl.startsWith("https://") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  return new URL(avatarUrl, env.apiUrl).toString();
}

export function getProfileErrorMessage(error: unknown): string {
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
      return "Сессия истекла. Войдите в аккаунт повторно.";
    }

    if (error.response?.status === 403) {
      return "У вас нет доступа к этому действию.";
    }

    if (!error.response) {
      return "Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось выполнить запрос. Попробуйте ещё раз.";
}
