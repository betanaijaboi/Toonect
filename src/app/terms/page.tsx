import type { Metadata } from "next";
import { LegalDocument, TERMS_DOC } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern using Toonect — accounts, content ownership, writer/artist deals, and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalDocument doc={TERMS_DOC} />;
}
