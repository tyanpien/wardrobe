import type { AuthResponse } from "@/shared/api/auth";

export function saveAuthSession(data: AuthResponse): void {
  const { user, tokens } = data;

  localStorage.setItem("dobry-shkaf-access-token", tokens.access_token);
  localStorage.setItem("dobry-shkaf-refresh-token", tokens.refresh_token);

  localStorage.setItem(
    "dobry-shkaf-user",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city ?? "",
      about: user.about ?? "",
      photo: user.avatar_url ?? "",
      system_role: user.system_role,
      created_at: user.created_at,
    }),
  );

  window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
}

export function clearAuthSession(): void {
  localStorage.removeItem("dobry-shkaf-access-token");
  localStorage.removeItem("dobry-shkaf-refresh-token");
  localStorage.removeItem("dobry-shkaf-user");

  window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
}
