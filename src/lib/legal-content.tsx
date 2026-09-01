export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalDoc {
  heading: string;
  lastUpdated: string;
  intro?: string[];
  sections: LegalSection[];
}

export const TERMS_DOC: LegalDoc = {
  heading: "Terms of Service",
  lastUpdated: "August 25, 2026",
  intro: [
    "Toonect connects comic/manga/manhwa/manhua writers with artists. By using Toonect, you agree to these Terms.",
  ],
  sections: [
    {
      title: "1. The service",
      body: [
        "Writers post story briefs; artists showcase portfolios and message writers about work. Toonect charges zero platform fees on connections made through the app. Toonect is provided \"AS IS\" and \"AS AVAILABLE,\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
      ],
    },
    {
      title: "2. Accounts",
      body: [
        "You're responsible for your account credentials and everything that happens under your account. We may suspend or terminate accounts that violate these Terms or our DMCA / Copyright Policy.",
      ],
    },
    {
      title: "3. Your content (story briefs, portfolio pieces, messages)",
      body: [
        "You keep ownership of everything you post. By posting, you grant Toonect a non-exclusive, worldwide license to host, display, and distribute it as needed to run the platform (showing it to other users, search/discovery). You confirm you have the rights to post what you upload — see our DMCA / Copyright Policy for how copyright complaints are handled.",
      ],
    },
    {
      title: "4. Deals between writers and artists",
      body: [
        "Toonect facilitates introductions and messaging. Any work agreement, payment, deadline, or dispute between a writer and an artist is between those two parties — Toonect is not a party to that agreement, does not guarantee project outcomes, and is not liable for disputes, non-payment, or unfinished work arising between users.",
      ],
    },
    {
      title: "5. Prohibited use",
      body: [
        "No posting content you don't have rights to, no impersonation, no harassment of other users, no attempts to break or reverse-engineer the platform.",
      ],
    },
    {
      title: "6. Limitation of liability",
      body: [
        "To the maximum extent permitted by law, Toonect/the operator is not liable for indirect, incidental, or consequential damages, or for any amount exceeding what you've paid Toonect in the last 12 months (currently $0 — the platform charges no fees).",
      ],
    },
    {
      title: "7. Indemnification",
      body: [
        "You agree to indemnify Toonect against claims arising from content you post or your violation of these Terms.",
      ],
    },
    {
      title: "8. Termination",
      body: [
        "We may suspend or terminate access at our discretion, including for violations of these Terms or repeated copyright infringement.",
      ],
    },
    {
      title: "9. Governing law",
      body: ["These Terms are governed by the laws of Nigeria."],
    },
    {
      title: "10. Changes",
      body: ["We may update these Terms; continued use after a change means you accept the update."],
    },
    {
      title: "11. Contact",
      body: ["Budoessien2331@outlook.com"],
    },
  ],
};

export const PRIVACY_DOC: LegalDoc = {
  heading: "Privacy Policy",
  lastUpdated: "August 25, 2026",
  sections: [
    {
      title: "What we collect",
      body: [
        "Account info: email, display name, password (handled via Supabase Auth — we never see or store your raw password).",
        "Profile content: portfolio pieces, story briefs, availability status.",
        "Messages sent through the platform's real-time messaging.",
        "Uploaded files (art, portfolio images) stored via Supabase Storage.",
      ],
    },
    {
      title: "Why we collect it",
      body: [
        "To run the core service: creating your profile, matching writers with artists, enabling messaging, and displaying your portfolio/briefs to other users.",
      ],
    },
    {
      title: "Who we share it with",
      body: [
        "Supabase — our database, auth, storage, and real-time messaging provider (see Supabase's own privacy policy at supabase.com/privacy).",
        "We do not sell your personal data.",
      ],
    },
    {
      title: "Your rights (Nigeria Data Protection Act 2023)",
      body: [
        "You can request access to, correction of, or deletion of your data at any time. Deleting your account removes your profile and uploaded content; messages sent to other users may remain in their conversation history.",
      ],
    },
    {
      title: "Data retention",
      body: ["We keep your data as long as your account is active, or until you request deletion."],
    },
    {
      title: "Security",
      body: [
        "Authentication and storage are handled through Supabase's managed infrastructure (encryption in transit and at rest). We don't independently store your password.",
      ],
    },
    {
      title: "Contact",
      body: ["Data questions: Budoessien2331@outlook.com"],
    },
  ],
};

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-1">{doc.heading}</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Last updated: {doc.lastUpdated}</p>
      {doc.intro?.map((p, i) => (
        <p key={i} className="text-[var(--muted)] leading-relaxed mb-6">
          {p}
        </p>
      ))}
      <div className="flex flex-col gap-6">
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold mb-2">{section.title}</h2>
            {section.body.map((p, i) => (
              <p key={i} className="text-[var(--muted)] leading-relaxed text-sm mb-2 last:mb-0">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
