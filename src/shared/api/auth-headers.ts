export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("dobry-shkaf-access-token");
}

export function requireAccessToken(): string {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Необходимо войти в аккаунт.");
  }

  return token;
}

export function authHeaders(token?: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token ?? requireAccessToken()}`,
  };
}
