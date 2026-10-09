import Link from "next/link";
import { Card, PageHeader } from "@/shared/ui";
import styles from "../auth.module.css";
import { LoginForm } from '@/features/auth/ui/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
