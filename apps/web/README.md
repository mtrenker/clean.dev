This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Proton Pass secrets

`apps/web/.env` contains non-secret defaults. `apps/web/.env.pass` contains secret references used by `pnpm dev` and the database migration command. Secret loading happens in the consuming workspace, so `pnpm dev` works from both the repository root and `apps/web`.

Proton Pass setup requires `pass-cli` 2.3.3, a manually created vault, and an authenticated editor-scoped session. From the repository root, create and populate the item named by the committed references:

```bash
pnpm pass:provision clean-dev-local web-development
pnpm dev
```

The provisioning command prompts without echo and sends the complete item to `pass-cli item create custom --from-template -` through stdin. Use a viewer-scoped session for normal development after provisioning. Contributors without vault access can run the public site with `pnpm --filter @cleandev/web dev:raw`; authenticated and database-backed features will not work.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Print and PDF checks

The CV at `/work` and the AI practice brief use static Source Sans 3 TrueType
fonts from `src/app/_fonts` under print media. Keep these separate from the
screen fonts: Firefox/Cairo can turn the Google Fonts face into vector outlines,
which look correct but lose selection, search, and CV-parser text.

PDF tests require Poppler's `pdftotext` and `pdffonts` on `PATH`:

```bash
# Debian/Ubuntu
sudo apt-get install poppler-utils
# macOS
brew install poppler

pnpm exec playwright install chromium firefox
pnpm exec playwright test e2e/work-print-cv.spec.ts e2e/ai-practice-brief.spec.ts \
  --grep "prints" --project=desktop-chromium --project=desktop-firefox
```

These checks inspect the exported Chromium PDFs, including embedded fonts and
extractable content. Playwright cannot export Firefox PDFs, so Firefox checks
cover print layout and font loading. When changing print fonts, also save a PDF
from Firefox and run `pdftotext document.pdf -` and `pdffonts document.pdf`.
Body text and company names must survive extraction, not just the mono labels.
Existing PDFs must be regenerated after a print fix.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
