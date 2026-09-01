import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Join Toonect",
  description: "Create a free Toonect account as a writer or artist — no platform fees, ever.",
  alternates: { canonical: "/auth/signup" },
};

export default function SignupPage() {
  return <SignupForm />;
}
