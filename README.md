# Hopeland Global Checkers

The official website for the Hopeland Global Checkers World Championship — an original React + Tailwind CSS + Supabase implementation with a public marketing site, multi-language support, a paid Stripe registration flow, and an admin dashboard for managing registrations, videos, sponsors, and blog content.

> Visual and animation style is structurally inspired by modern crypto/fintech marketing sites (alternating dark/light sections, pill-shaped CTAs, scroll-reveal animations, animated stat counters, sticky blurring header, mobile app-style bottom nav). No text, imagery, logos, or crypto/exchange content was copied — all copy is original placeholder content for a checkers championship.

## Tech Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (CSS-first theme via `@theme`, no `tailwind.config.js` needed)
- **Framer Motion** for scroll-reveal, count-up stats, carousels, and page transitions
- **React Router v7** for public + admin routing
- **Supabase** — Postgres, Auth, Storage, Edge Functions
- **Stripe Checkout** (via Supabase Edge Functions) for the registration fee
- **`@tanstack/react-query`** for server state, **`zustand`** for lightweight UI state
- **`react-hook-form` + `zod`** for form validation
- **`react-i18next`** for a curated 8-language i18n setup with browser/country auto-detection
- **`embla-carousel-react`**, **`lucide-react`**, **`xlsx` + `file-saver`**, **`sonner`**, **`react-helmet-async`**

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

### Demo mode (no backend required)

The app runs fully in **demo mode** out of the box: if `.env` has no Supabase credentials, all data hooks (`useVideos`, `useSponsors`, `useBlogPosts`, `useRegistrations`) fall back to the mock data in `src/lib/mockData.ts`, the Register form simulates a successful "checkout," and the Admin Dashboard (`/admin`) is left open (no login required) so the UI can be reviewed end-to-end without provisioning anything. This is intentional — connect Supabase and Stripe (below) to go live.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) (or run `supabase start` locally with the [Supabase CLI](https://supabase.com/docs/guides/cli)).
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from your project settings.
3. Apply the schema — two options, pick whichever is easier for you:
   - **No CLI needed:** open your project's **SQL Editor** in the Supabase Dashboard
     (`https://supabase.com/dashboard/project/<your-project-ref>/sql/new`), paste the entire contents of
     [`supabase/SETUP.sql`](./supabase/SETUP.sql), and click **Run**. It's a single file with every table, RLS
     policy, and storage bucket the app needs (safe to re-run).
   - **Via CLI** (you don't need to install anything globally — `npx` fetches it on demand):
     ```bash
     npx supabase login                          # opens a browser to authenticate once
     npx supabase link --project-ref your-project-ref
     npx supabase db push                        # applies supabase/migrations/*.sql
     npx supabase db seed                         # optional: loads supabase/seed.sql sample data
     ```

   The migrations create `registrations`, `videos`, `sponsors`, `blog_posts`, and `profiles` tables with row-level security — public users can read published content and submit registrations. Every Auth user gets a `profiles` row with role `user` by default; only `admin` / `superadmin` can open `/admin` (RLS + client check). After creating a login in **Authentication → Users**, promote it with [`supabase/PROMOTE_ADMIN.sql`](./supabase/PROMOTE_ADMIN.sql) (or the SQL at the bottom of `SETUP.sql`).
4. Storage buckets (`videos`, `sponsor-logos`, `blog-covers`) are created by the same migrations for admin file uploads.

## Connecting Stripe

Put **both** Stripe keys in `.env` (secret key must **not** use a `VITE_` prefix — it never goes to the browser):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SITE_URL=http://127.0.0.1:5173
```

### Local / `npm run dev`

Restart the dev server after saving `.env`. Register Now uses a local Vite endpoint
(`/api/create-checkout-session`) that reads `STRIPE_SECRET_KEY` from `.env` and opens Stripe Checkout.

### Production (Supabase Edge Functions)

1. Deploy functions:
   ```bash
   npx supabase functions deploy create-checkout-session --project-ref YOUR_REF
   npx supabase functions deploy stripe-webhook --project-ref YOUR_REF
   ```
2. Sync secrets from `.env` (needs `SUPABASE_ACCESS_TOKEN`):
   ```bash
   npm run stripe:sync
   ```
3. In Stripe Dashboard → Webhooks, add  
   `https://YOUR_REF.supabase.co/functions/v1/stripe-webhook`  
   event: `checkout.session.completed`. Copy the signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`, then run `npm run stripe:sync` again.

Legacy notes below (same flow, more detail):

5. In the Stripe Dashboard, add a webhook endpoint pointing at the deployed `stripe-webhook` function URL
   (`https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`), listening for `checkout.session.completed`.
   Copy the **Signing secret** Stripe gives you and set it too (Dashboard secrets UI, or):
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

Once connected, `RegistrationForm` calls `create-checkout-session`, redirects to real Stripe Checkout, and — **only if
the payment actually succeeds** — the `stripe-webhook` function creates the registration record directly with
`status: 'paid'`, which then shows up immediately in `/admin/registrations` with Excel/CSV export. If the payment is
cancelled or declined, no record is ever created (nothing to review or clean up in the Admin Dashboard), and the user
is redirected to `/register/cancelled`, which reads "Payment Failed" and prompts them to register again.

Switching between Stripe test mode and live mode is just a matter of re-running step 4 with `sk_test_...`/`sk_live_...`
— no code changes or redeploys needed.

## Internationalization

`src/lib/i18n.ts` configures `react-i18next` with 8 languages (English, Spanish, French, Portuguese, German, Arabic, Hindi, Chinese). On first visit, language is detected from the browser (`i18next-browser-languagedetector`) and refined via a lightweight IP-geolocation lookup (`VITE_GEO_LOOKUP_URL`, defaults to ipapi.co) mapped to a language through `countryToLanguage`. Users can always override via the `LanguageSwitcher` in the header, which persists to `localStorage`.

Navigation, footer, and hero copy are fully translated per language (`src/locales/*/common.json`, `home.json`). Long-form marketing/blog copy currently ships in English only with `fallbackLng: 'en'` — extending full-page translation coverage is a content workflow that can be layered in incrementally by adding keys to the existing namespaces.

## Project Structure

```
src/
├─ components/   common (Button, Card, Modal, ...), layout, home sections,
│                cards, forms, admin (DataTable, FileUploadDropzone, ...)
├─ pages/        public/ and admin/ route components
├─ layouts/      PublicLayout, AdminLayout
├─ routes/       route tree (lazy-loaded)
├─ hooks/        React Query data hooks + useCountUp, useCountryLocale
├─ context/      AuthContext (Supabase Auth)
├─ store/        zustand ui store (menus, sidebar)
├─ lib/          supabaseClient, stripeClient, i18n, validators (zod),
│                exportToExcel, seo (JSON-LD), mockData, utils
├─ locales/      en/es/fr/pt/de/ar/hi/zh translation JSON
└─ types/        database.types.ts (mirrors Supabase schema)

supabase/
├─ migrations/   schema + RLS policies
├─ functions/    create-checkout-session, stripe-webhook, get-registration-by-session,
│                get-registration, update-registration-profile (Deno)
└─ seed.sql      sample data for local dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint

## Notes & Follow-ups

- **Prerendering**: this is a Vite SPA, so public routes are client-rendered. For maximum SEO on static pages, consider adding a prerender step (e.g. `vite-plugin-prerender` or a small Puppeteer script) as a follow-up before launch.
- **Rich text editor**: `RichTextEditor` is an intentionally lightweight markdown-style toolbar over a `<textarea>` to keep the bundle small; swap in a full WYSIWYG (e.g. Tiptap) if richer editing is needed.
- **Admin roles**: with Supabase connected, `/admin` requires `profiles.role` of `admin` or `superadmin`. Regular Auth users stay `user` and are rejected on the login form. Demo mode (no Supabase) still leaves the dashboard open for UI review.
