import type { Metadata } from "next";
import { LegalDocument, PRIVACY_DOC } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Toonect collects, why, who it's shared with, and your data rights under Nigeria's Data Protection Act.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_DOC} />;
}
