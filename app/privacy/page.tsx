/* ─────────────────────────────────────────────────────────────────────────
   app/privacy/page.tsx

   Public Privacy Policy page (includes the merged Cookies & Tracking
   Technologies section). Content lives in content/privacy-policy.md and is
   read server-side at render time, then rendered with react-markdown inside
   Tailwind's typography (`prose`) layer.

   Styled with the public-site "Stitch" tokens (see app/globals.css /
   tailwind.config.ts) so it matches the marketing site's look — Navbar and
   top padding are supplied by RootLayoutClient, not duplicated here.
───────────────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How NEIOX collects, uses, and protects your personal data, including our use of cookies and other tracking technologies.',
};

function getPrivacyPolicyMarkdown(): string {
  const filePath = path.join(process.cwd(), 'content', 'privacy-policy.md');
  return fs.readFileSync(filePath, 'utf8');
}

export default function PrivacyPolicyPage() {
  const markdown = getPrivacyPolicyMarkdown();

  return (
    <div className="bg-neiox-surface">
      <div className="site-container site-section">
        <article
          className="
            prose prose-slate mx-auto max-w-3xl

            prose-headings:font-display prose-headings:font-medium
            prose-headings:tracking-tight prose-headings:text-neiox-on-surface

            prose-h1:text-4xl prose-h1:font-semibold sm:prose-h1:text-5xl
            prose-h2:mt-12 prose-h2:border-b prose-h2:border-neiox-outline-variant
            prose-h2:pb-3 prose-h2:text-2xl
            prose-h3:text-lg

            prose-p:text-neiox-on-surface-variant
            prose-li:text-neiox-on-surface-variant
            prose-strong:text-neiox-on-surface

            prose-a:text-neiox-primary prose-a:no-underline
            prose-a:transition-colors hover:prose-a:text-neiox-primary-container
            hover:prose-a:underline

            prose-hr:border-neiox-outline-variant

            prose-table:text-sm
            prose-thead:border-neiox-outline-variant
            prose-th:text-neiox-on-surface
            prose-td:text-neiox-on-surface-variant
            prose-tr:border-neiox-outline-variant

            prose-code:text-neiox-on-surface
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
