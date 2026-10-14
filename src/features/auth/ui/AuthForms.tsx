"use client";

import { useRouter } from "next/navigation";
import { Button, Checkbox, Input } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

function saveUser(name: string, email: string) {
  localStorage.setItem(
    "dobry-shkaf-user",
    JSON.stringify({
      name: name || email.split("@")[0] || "Пользователь",
      email,
      city: "Местоположение",
      about: "",
      photo: "",
    }),
  );

  window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
}

export function LoginForm() {
  const router = useRouter();

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") || "");

        saveUser("", email);
        router.push("/profile");
        router.refresh();
      }}
    >
      <Input
        name="email"
        label="Электронная почта"
        type="email"
        autoComplete="email"
        required
      />

      <Input
        name="password"
        label="Пароль"
        type="password"
        autoComplete="current-password"
        required
      />

      <Button type="submit">Войти</Button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        saveUser(
          String(form.get("name") || ""),
          String(form.get("email") || ""),
        );

        router.push("/profile");
        router.refresh();
      }}
    >
      <Input
        name="name"
        label="Имя"
        autoComplete="name"
        required
      />

      <Input
        name="email"
        label="Электронная почта"
        type="email"
        autoComplete="email"
        required
      />

      <Input
        name="password"
        label="Пароль"
        type="password"
        autoComplete="new-password"
        required
      />

      <Checkbox
        name="consent"
        label="Согласен на обработку персональных данных"
      />

      <Button type="submit">Зарегистрироваться</Button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      type="button"
      onClick={() => {
        localStorage.removeItem("dobry-shkaf-user");

        window.dispatchEvent(new Event("dobry-shkaf-user-updated"));

        router.push("/");
        router.refresh();
      }}
    >
      Выйти
    </Button>
  );
}