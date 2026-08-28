# Ash & Kash — Premium Women's Fashion E-Commerce Platform

A production-oriented e-commerce platform for a premium women's fashion boutique, built with:

```
Next.js (App Router) + TypeScript
   ↓
Server Actions / Route Handlers
   ↓
Prisma
   ↓
MySQL
```

Everything on the storefront — categories, collections, products, variants, homepage
sections, sliders, menus, pages, blog, currencies, shipping, coupons — is database-driven
and managed from a custom `/admin` dashboard. Nothing is hard-coded.

## 1. Architecture

```
src/
  app/
    (storefront)/        Public storefront routes — home, shop, product, cart, checkout, account, blog...
    admin/                Admin dashboard (protected) — products, orders, content, settings...
    api/                  Route Handlers — file uploads, search suggestions, admin notifications
    layout.tsx            Root layout (fonts, global CSS)
    sitemap.ts / robots.ts
  actions/                Server Actions — storefront mutations (cart, checkout, auth, reviews...)
    admin/                Server Actions for admin CRUD, grouped by resource
  components/
    storefront/           Header, footer, cart drawer, product card, homepage sections...
    admin/                Admin shell, forms, tables
    account/              Customer account UI
  lib/
    auth/                 Session (JWT cookie), password hashing, RBAC
    currency/             Currency formatting + DB-backed resolution
    data/                 Read-only Prisma queries used by pages (products, homepage, menu, settings, analytics)
    prisma.ts             Prisma client singleton
    cart.ts / cart-view.ts / pricing.ts / checkout.ts / coupon.ts / shipping.ts
                           The order/pricing engine — always recomputes prices server-side
    storage.ts            Local (or S3-ready) file upload backend
  middleware.ts           Route protection (/admin, /account) + visitor-country cookie bootstrap
  types/
prisma/
  schema.prisma           Full data model
  seed.ts                 Realistic demo data (products, orders, currencies, shipping, CMS content...)
```

### Why this shape

- **One Next.js app, one database.** No separate backend service — Server Actions and
  Route Handlers are the API layer, calling Prisma directly. This is what makes it simple
  to deploy on Hostinger's Node.js hosting.
- **Server-authoritative pricing.** `src/lib/pricing.ts` and `src/lib/checkout.ts` always
  re-fetch product/variant prices, coupon rules, and shipping costs from the database at
  order time — the client never supplies a price that is trusted.
- **Unified `User` model** with a `userRole` enum (`CUSTOMER` / `SUPER_ADMIN` /
  `MANAGER` / `PRODUCT_MANAGER` / `ORDER_MANAGER` / `CONTENT_MANAGER`) instead of two
  parallel auth tables. Role → permission mapping lives in `src/lib/auth/rbac.ts` and is
  enforced both in page guards (`requireAdmin`) and inside every admin Server Action
  (`requireAdminAction`), since Server Actions are directly invokable and must not rely on
  page-level checks alone.

## 2. Environment variables

See `.env.example` for the full list with descriptions. At minimum you need:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `AUTH_SECRET` | Signs session cookies — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Used for canonical URLs, OG tags, sitemap |
| `SEED_ADMIN_PASSWORD` | Password for the admin account created by the seed script |
| `IMAGE_STORAGE` | `local` (default) or `s3` (see §7) |

Never commit a real `.env` file — only `.env.example` is checked in.

## 3. Local development

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET
npm run db:push           # creates tables from prisma/schema.prisma
npm run db:seed           # loads demo data + creates the admin user
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin/login (`admin@ashkash.test` / value of `SEED_ADMIN_PASSWORD`)
- Demo customer: `fatima@example.com` / `password123`

## 4. Deploying to Hostinger

Hostinger's Node.js hosting runs `npm install`, a build command, and a start command
against a Git-connected repository — no Docker or custom infra required.

1. **Create the MySQL database.** In hPanel → Databases → MySQL Databases, create a
   database and user, and note the host/port/name/user/password.
2. **Create the Node.js application.** In hPanel → Advanced → Node.js, create a new
   application:
   - Node.js version: **20.x or later**
   - Application root: the repository root (or the subfolder you deployed it to)
   - Application startup file: leave as default; the start command below is what actually
     boots the app
3. **Connect GitHub.** Point the Node.js app (or Hostinger's Git deployment feature) at
   this repository and the branch you want to deploy.
4. **Set environment variables** in the Node.js app's environment variables panel —
   `DATABASE_URL` (pointing at the database created in step 1), `AUTH_SECRET`,
   `NEXT_PUBLIC_APP_URL` (your real domain, e.g. `https://ashkash.com`), `IMAGE_STORAGE=local`.
5. **Install & build.** Hostinger runs `npm install` automatically on deploy (this also
   runs `prisma generate` via the `postinstall` script). Set the build command to:
   ```bash
   npm run build
   ```
   which runs `prisma generate && next build`.
6. **Run database migrations** (one-time, and again after any schema change). SSH into
   the app (hPanel → Node.js → the app → "Open Terminal", or any SSH access Hostinger
   provides) and run:
   ```bash
   npx prisma migrate deploy
   ```
   If you're not using migration files yet (this project ships with `db push` for
   simplicity), run `npx prisma db push` instead — see §6.
7. **Seed the database** (first deploy only):
   ```bash
   npm run db:seed
   ```
8. **Set the start command** to:
   ```bash
   npm run start
   ```
   (`next start`, listening on the port Hostinger assigns via `PORT`).
9. **Domain & SSL.** Attach your domain to the Node.js app in hPanel, then enable SSL —
   Hostinger provisions a free Let's Encrypt certificate automatically once the domain
   resolves to it.
10. **Image storage.** With `IMAGE_STORAGE=local`, uploaded images are written to
    `/public/uploads` on the server's disk. This works well for a single-instance
    deployment (the Hostinger default). If you later move to a multi-instance / serverless
    setup, switch to S3-compatible storage (§7) so uploads survive redeploys.

### Redeploying after code changes

Push to the connected branch, then in the Hostinger Node.js panel trigger a redeploy (or
let auto-deploy run). This re-runs `npm install` → `npm run build` → restarts the app
with `npm run start`. If you changed `prisma/schema.prisma`, also re-run the migration
step (§6) before restarting.

## 5. Project structure conventions

- **Server Components by default.** Only components that need interactivity (forms,
  dropdowns, the cart drawer) are marked `"use client"`. Data fetching happens in Server
  Components and Server Actions, not in client-side `useEffect` calls.
- **Validation** with `zod` in every Server Action that accepts form input.
- **No client-trusted prices.** `computeCartTotals()` and `createOrderFromCart()` are the
  only places order totals are calculated, always from live database rows.

## 6. Database migrations

This project ships configured for `prisma db push` (fast iteration, no migration history)
to keep the initial setup simple. For a production app you maintain over time, switch to
proper migrations:

```bash
npx prisma migrate dev --name init     # generates prisma/migrations/, run locally
npx prisma migrate deploy              # applies pending migrations, run on the server
```

Once you've generated your first migration, use `migrate deploy` (not `db push`) for every
subsequent deployment so schema changes are tracked and reversible.

## 7. Image storage

`src/lib/storage.ts` is the single function (`saveUploadedFile`) every image upload goes
through — the rest of the app only depends on the URL string it returns.

- **`IMAGE_STORAGE=local`** (default): writes to `/public/uploads`, served directly by
  Next.js. Zero setup, works immediately on Hostinger.
- **`IMAGE_STORAGE=s3`**: the function currently throws with instructions — install
  `@aws-sdk/client-s3`, implement the upload call in `saveUploadedFile()`, and set the
  `AWS_*` environment variables from `.env.example`. No other code needs to change since
  every caller only consumes the returned URL.

## 8. Backup & safety

- **Database backup**: `mysqldump -u <user> -p <database> > backup.sql` (schedule via cron
  or Hostinger's built-in database backup feature if available on your plan).
- **Database restore**: `mysql -u <user> -p <database> < backup.sql`.
- **Image backup**: with local storage, back up `/public/uploads` alongside the database
  (a product's image URLs reference files there). With S3 storage, rely on your bucket's
  own versioning/backup.
- **Environment variables**: keep a secure copy of your production `.env` values outside
  of git (e.g. in your password manager) — they are not recoverable from the repository.
- **Safe deployment procedure**: back up the database before running `prisma migrate
  deploy` on production, especially for migrations that drop or rename columns.

## 9. Known simplifications

Being transparent about what's intentionally simplified in this build, so nothing is
mistaken for "broken":

- **Rich text editing** for product/page/blog content uses plain HTML `<textarea>` fields
  rather than a WYSIWYG editor. The rendered output uses the same HTML, so content is
  fully functional — admins comfortable with basic HTML (or pasting from another editor)
  can use it as-is; swapping in a WYSIWYG editor (e.g. Tiptap) is a drop-in replacement for
  those textareas.
- **Size guide rows** are created with empty measurement values from `/admin/products/attributes`;
  editing the actual numbers per size currently requires a follow-up admin screen (not yet
  built) or a direct database edit.
- **Automatic collections** support a fixed rule set (category, featured/best-seller/new/sale
  flags) rather than an open-ended rule builder.
- **Drag-and-drop reordering** (sliders, homepage sections, categories, shipping zones, menu
  items, product variants/images) is implemented as up/down arrow buttons rather than
  pointer-drag — same end result, zero extra client-side dependencies.
- **Seed script idempotency**: core entities (users, products, categories, currencies,
  coupons, pages, tags) use upserts and are safe to re-run. Instance-like content (hero
  slides, homepage sections, shipping zones, menu items, demo orders) uses plain creates —
  re-running `npm run db:seed` on a database that already has this data will duplicate it.
  For a clean reseed, wipe the database (`npx prisma migrate reset` or drop/recreate) first.
- **Email sending** (order confirmations, password reset links, shipping updates) is
  architected in `src/lib/email.ts` with a single `sendEmail()` entry point but has no
  provider wired in by default — it logs to the console until `EMAIL_PROVIDER` is set and
  the provider call is implemented.
- **Newsletter signup** persists subscribers locally (`NewsletterSubscriber` table) but
  does not push them to Mailchimp/Klaviyo/Brevo — the provider selector in Settings is
  ready for that integration.
- **Geolocation** uses free CDN/proxy headers (Cloudflare's `CF-IPCountry`, Vercel's
  `x-vercel-ip-country`) with a configurable default-country fallback — no paid IP
  geolocation API is required, though one can be added in `src/middleware.ts`.

## 10. Production checklist

Before going live:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # prisma generate && next build — must succeed with zero errors
```

Then manually verify (see §9 for anything intentionally out of scope):

- Admin login, and login is rejected for a disabled/deleted admin
- Create → edit → delete a product, including variants and images
- Create a category and collection; confirm they appear on the storefront immediately
- Add to cart (with and without variants), update quantity, remove item
- Apply and remove a coupon; confirm invalid/expired coupons are rejected
- Complete a Cash on Delivery checkout; confirm inventory decrements and the order
  appears in `/admin/orders`
- Change an order's status and confirm the customer-facing order timeline updates
- Register a customer account, log in, view order history, add/remove an address
- Submit a product review and approve it from `/admin/reviews`; confirm it then appears
  on the product page
- Switch currency manually, and confirm prices update sitewide
- Toggle a homepage section off and confirm it disappears from `/`
- Visit `/sitemap.xml` and `/robots.txt`
- Resize the browser to 320px/375px/768px/1024px/1440px and confirm no horizontal scroll
