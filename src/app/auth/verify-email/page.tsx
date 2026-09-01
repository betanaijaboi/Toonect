import type { Metadata } from "next";
import VerifyEmailForm from "./VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Confirm your email address to activate your Toonect account.",
  alternates: { canonical: "/auth/verify-email" },
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
