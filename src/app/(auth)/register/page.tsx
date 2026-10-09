import Link from "next/link";
import { Card, PageHeader } from "@/shared/ui";
import { CreateOrganizationForm } from "@/features/create-organization";
import styles from "../auth.module.css";
import { RegisterForm } from '@/features/auth/ui/RegisterForm';

export default function RegisterPage() {
  return <RegisterForm />;
}