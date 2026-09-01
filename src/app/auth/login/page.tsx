import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Toonect account to message artists, manage your portfolio, or track your story briefs.",
  alternates: { canonical: "/auth/login" },
};

export default function LoginPage() {
  return <LoginForm />;
}
