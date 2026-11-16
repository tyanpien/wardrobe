
import axios from "axios";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{
      field?: string;
      message?: string;
    }>;
  };
  detail?: string | Array<{ msg?: string }>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Не удалось выполнить запрос. Попробуйте ещё раз.",
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorBody | undefined;

    if (status === 403) {
      return "Доступ запрещён. У вас недостаточно прав для выполнения этого действия.";
    }

    if (status === 401) {
      return "Сессия истекла. Войдите в аккаунт повторно.";
    }

    if (status === 404) {
      return "Объект не найден.";
    }

    const apiMessage = data?.error?.message;

    if (apiMessage) {
      const details = data?.error?.details
        ?.map((item) => item.message)
        .filter((message): message is string => Boolean(message));

      if (details && details.length > 0) {
        return `${apiMessage}: ${details.join(". ")}`;
      }

      return apiMessage;
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item) => item.msg)
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) {
        return messages.join(". ");
      }
    }

    if (!error.response) {
      return "Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
