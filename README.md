# Ash & Kash — Premium Women's Fashion Boutique Platform

A full, database-backed eCommerce platform for a women's fashion boutique: a
premium Tailwind/Livewire storefront, a Shopify-style admin CMS built on
[Filament](https://filamentphp.com), and a Laravel/MySQL backend that owns
every piece of data the storefront renders. Nothing on the storefront is
hard-coded — products, categories, collections, homepage sections, menus,
currencies, shipping, coupons and content are all created and edited from the
admin panel and reflected immediately on the live site.

## Architecture

- **Framework:** Laravel 11 (PHP 8.2+)
- **Admin CMS:** [Filament v3](https://filamentphp.com) — Shopify-style resources, relation managers, dashboard widgets
- **Storefront:** Blade + [Livewire 3](https://livewire.laravel.com) (cart drawer, add-to-cart, wishlist, search, cart page) + Alpine.js (bundled with Livewire) + Tailwind CSS
- **Database:** MySQL (tested) — PostgreSQL also works via `DB_CONNECTION=pgsql`
- **Auth:** Two separate guards — `web` (admin/staff users, via `users` table + Spatie roles/permissions) and `customer` (storefront shoppers, via `customers` table)
- **Media:** [Spatie Media Library](https://spatie.be/docs/laravel-medialibrary) — multi-image upload, reordering, image conversions (thumb/card)
- **Roles & permissions:** [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- **SEO:** [Spatie Laravel Sitemap](https://spatie.be/docs/laravel-sitemap), per-entity SEO fields, JSON-LD structured data, dynamic meta/OG tags

### Why this stack

Filament gives a genuinely production-grade, database-wired admin CMS
(every screen is real CRUD against Eloquent models — no mock data) far
faster and more robustly than a hand-rolled admin panel, while still being
fully customizable (see `app/Filament/Resources/*`). The storefront is
plain Blade + Livewire so it needs no separate JS build/API layer — every
page is server-rendered from the same models the admin panel edits.

### Currency architecture (important)

All prices are entered and stored in the store's **base currency**
(`SHOP_BASE_CURRENCY`, defaults to `PKR`) — on `products`, `product_variants`,
`shipping_methods`, `coupons`, and `orders`. The **display currency** shown to
a visitor is a pure presentation concern, resolved by
`App\Services\CurrencyService`:

- `currency()->current()` — the visitor's active display currency (from
  session, defaulting to a IP-based country → currency lookup on first visit,
  overridable via the header currency selector).
- `currency()->convert($baseAmount)` / `money($baseAmount)` — converts +
  formats a base-currency amount using the admin-configured `exchange_rate`,
  `decimal_places`, `symbol`, `symbol_position` and separators on the
  `currencies` table (Admin → Store settings → Currencies).
- Exchange rates are **never hard-coded** in Blade/JS — only in the database,
  editable by an admin.
- `App\Models\Country` maps ISO2 country codes to a `Currency`, used both by
  the IP-geolocation middleware (`App\Http\Middleware\DetectCurrency`, via
  `stevebauman/location`) and by shipping-zone country matching.

### Database schema

45 migrations covering: users/roles/permissions, customers/addresses,
categories (self-referencing), brands, tags, products, product options/values
(Size, Color, ...), product variants (independent SKU + stock per
combination), collections (manual or rule-based), size guides, inventory
logs, reviews, wishlists, carts/cart items, shipping zones/methods, coupons +
usage tracking, orders/order items/order status history, CMS pages, blog
posts/categories, sliders, homepage sections, testimonials, menus/menu items,
currencies, countries, and a generic `settings` key-value store for brand/
checkout/SEO defaults. See `database/migrations/`.

## Getting started

### Requirements

- PHP 8.2+, Composer
- Node.js 18+ / npm
- MySQL 8 (or MariaDB 10.6+)

### Installation

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

# Create the database (adjust credentials to match your .env)
mysql -u root -e "CREATE DATABASE ash_kash_boutique;"

php artisan migrate
php artisan storage:link

# Seed realistic demo data: roles, admin user, currencies, countries,
# shipping zones, 3 categories, ~18 products with size/color variants and
# real inventory, collections, coupons, sliders, homepage sections, CMS
# pages, menus, blog posts, testimonials, sample customers & orders.
# Every demo record is flagged `is_demo = true` so it's easy to identify
# and remove before going to production.
php artisan db:seed

npm run build   # or `npm run dev` while developing
php artisan serve
```

Visit the storefront at `http://localhost:8000` and the admin panel at
`http://localhost:8000/admin`.

**Demo admin login:** `admin@ashkash.test` / `password` (Super Admin role —
change this password immediately in any non-local environment).

**Demo customer login:** `ayesha@example.com` / `password`.

### Running tests

```bash
# Tests run against a separate `ash_kash_boutique_test` database (see phpunit.xml)
# so `php artisan test` never touches your dev/demo data.
mysql -u root -e "CREATE DATABASE ash_kash_boutique_test;"
php artisan test
```

The suite covers: every admin resource + dashboard rendering with real
seeded data (including relation managers like product variants and order
timelines), the full guest cart → Cash on Delivery checkout → order
creation flow (asserting inventory is actually decremented and an
`inventory_logs`/`order_status_histories` trail is written), and stock
validation rejecting checkout when inventory has sold out.

## Admin panel guide

All content below is managed from `/admin` — nothing requires touching code.

| Area | Where |
|---|---|
| Add/edit products, variants, images, SEO | Catalog → Products |
| Categories, Collections, Brands, Tags, Size guides | Catalog |
| Orders, status workflow, tracking, invoice/packing slip | Orders |
| Customers, addresses, order history | Customers |
| Coupons | Marketing → Coupons |
| Homepage sliders & sections, testimonials, CMS pages, blog | Content / Blog |
| Header/footer navigation (with submenus, links to category/collection/product/page) | Content → Menus |
| Shipping zones & methods (per-country pricing, free shipping thresholds) | Store settings → Shipping zones |
| Currencies & exchange rates, country→currency mapping | Store settings → Currencies / Country → Currency mapping |
| Store name, logo, socials, checkout/COD toggle, SEO defaults | Store settings → General settings |
| Admin users & roles/permissions | Team |
| Sales dashboard (revenue trend, best sellers, low stock, recent orders) | Dashboard |

### Adding a product

Products → New Product → fill in General/Pricing & Inventory/Images/Options
& Variants/SEO tabs → set Status to **Active** → Save. If you add Size/Color
options, add matching rows in the **Variants** tab (per the product's relation
manager) with their own SKU and stock — each variant tracks its own
inventory independently (e.g. Black/S = 10, Black/M = 5, Red/S = 0).

### Managing sliders / homepage

Content → Sliders to manage the hero carousel (desktop + mobile images, copy,
button, text alignment, timing). Content → Homepage sections controls which
sections appear on `/` and in what order (hero, categories, featured
products — latest/best-seller/featured/sale/custom selection, collections,
brand story, testimonials, promo banner, newsletter, Instagram grid) — each
can be reordered and toggled on/off.

### Managing menus

Content → Menus → Header/Footer → Items. Each item can link to a custom URL,
a Category, a Collection, a Product, or a CMS Page, and can be nested under a
parent item to create a submenu (used for the Shop → category dropdown).

### Managing currencies

Store settings → Currencies to add/edit a currency's exchange rate (relative
to the base currency), symbol, decimal places and position. Store settings →
Country → Currency mapping controls which currency a country's visitors see
by default; visitors can always override via the header currency selector.

### Managing shipping

Store settings → Shipping zones → create a zone (list of ISO2 country codes,
or `*` for "rest of world"), then add one or more Methods per zone (name,
price in the base currency, free-shipping threshold, estimated delivery
days).

## Frontend routes

`/`, `/shop`, `/category/{slug}`, `/collection/{slug}`, `/product/{slug}`,
`/cart`, `/checkout`, `/checkout/confirmation/{order}`, `/wishlist`,
`/search`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, `/pages/{slug}`,
`/account` (+ `/orders`, `/addresses`, `/profile`), `/account/login`,
`/account/register`, `/sitemap.xml`, `/robots.txt`.

## Admin routes

`/admin`, `/admin/products`, `/admin/categories`, `/admin/collections`,
`/admin/brands`, `/admin/tags`, `/admin/orders`, `/admin/customers`,
`/admin/coupons`, `/admin/shipping-zones`, `/admin/currencies`,
`/admin/countries`, `/admin/sliders`, `/admin/homepage-sections`,
`/admin/testimonials`, `/admin/menus`, `/admin/pages`,
`/admin/blog-categories`, `/admin/blog-posts`, `/admin/reviews`,
`/admin/size-guides`, `/admin/users`, `/admin/roles`,
`/admin/manage-settings`.

## Known simplifications (and how to extend them)

Built to be genuinely functional end-to-end within the scope of this build;
a few areas are intentionally left as clear extension points rather than
fully built out, so nothing here is faked — it's just not maximally deep yet:

- **Email delivery** is architected (order confirmation/status-change hooks
  exist in `OrderService`/`EditOrder`) but wired to the `log` mailer by
  default — set `MAIL_MAILER` to a real provider (SES/Postmark/SMTP/Resend)
  in `.env` to send real email; no code changes needed.
- **Newsletter** signups are captured (`newsletter.subscribe` route) and the
  admin settings page has a provider selector (Mailchimp/Klaviyo/Brevo) —
  wire the actual API call in `HomeController::newsletter()` when you pick a
  provider.
- **Product variant matrix UI**: options (Size/Color) and variants are both
  real, independently-tracked Eloquent records (`product_options` →
  `product_option_values`, `product_variants` ↔ `product_variant_option_values`),
  and the storefront's variant selector reads this structure — but the admin
  variant relation manager takes each variant's combination as a free-text
  title (e.g. "Black / Medium") rather than an auto-generated combination
  matrix, to keep the admin UI approachable.
- **Role/permission enforcement**: roles and granular permissions are real
  (Spatie Laravel Permission, seeded in `RoleSeeder`), and `Super Admin`
  fully bypasses checks via a `Gate::before` hook — add
  `->authorize('view products')`-style Filament Resource policies for the
  other roles as your team grows.
- **Geolocation** uses `stevebauman/location`'s free IP driver and always
  falls back to `SHOP_DEFAULT_COUNTRY` on failure — never blocks the
  storefront.

## Production deployment

- Works on any standard PHP hosting target (Vercel is Node-oriented and not
  applicable to Laravel; use a VPS, Laravel Forge, Ploi, or a container
  platform).
- Run `composer install --optimize-autoloader --no-dev`, `npm run build`,
  `php artisan migrate --force`, `php artisan config:cache`,
  `php artisan route:cache`, `php artisan view:cache`.
- Point `FILESYSTEM_DISK`/media library at S3 (or another S3-compatible
  store) for uploaded images in a multi-server deployment.
- Set `APP_ENV=production`, `APP_DEBUG=false`, a strong `APP_KEY`, and swap
  `MAIL_MAILER` for a real provider.
- The database can be hosted separately (RDS, PlanetScale, managed MySQL) —
  just point `DB_*` at it.
