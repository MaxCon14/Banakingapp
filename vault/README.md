# Vault — Personal Savings PWA

A premium, dark-themed personal savings app. Deposit from your bank card via Stripe, save in goal pots, and withdraw back to your bank whenever you want. Installable as a PWA on iPhone and Android.

---

## Project Structure

```
vault/
  client/        React PWA (Vite + vite-plugin-pwa)
  server/        Node.js + Express API
  db/            PostgreSQL migrations + seed
  README.md
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string. e.g. `postgresql://user:pass@host:5432/vault` |
| `STRIPE_SECRET_KEY` | Your Stripe **secret** key. Starts with `sk_live_` or `sk_test_`. Found in Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret. Found in Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret. Starts with `whsec_` |
| `CLIENT_URL` | Your deployed frontend URL (e.g. `https://vault.vercel.app`). Used for CORS. |
| `PORT` | Port for the Express server. Default: `3001`. Railway sets this automatically. |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe **publishable** key. Starts with `pk_live_` or `pk_test_`. Safe to expose in frontend. |
| `VITE_API_URL` | Backend API base URL (e.g. `https://vault-api.up.railway.app`). Leave blank to use Vite proxy in dev. |

---

## Local Development

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or use [Railway](https://railway.app) free tier)
- A Stripe account (free to create)

### 2. Clone and install

```bash
cd vault

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 3. Set up the database

Create a local database:

```bash
createdb vault
```

Run the schema migration:

```bash
psql vault < db/migrations/001_initial.sql
```

Seed the single account row:

```bash
psql vault < db/seed.sql
```

### 4. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and Stripe keys

# Client
cp client/.env.example client/.env
# Edit client/.env with your Stripe publishable key
```

### 5. Run the server

```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

### 6. Run the client

```bash
cd client
npm run dev
# Runs on http://localhost:5173
# API calls are proxied to localhost:3001 automatically
```

### 7. Set up Stripe webhooks locally

Install the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3001/api/deposit/confirm
```

Copy the webhook signing secret printed (`whsec_...`) and put it in `server/.env` as `STRIPE_WEBHOOK_SECRET`.

---

## Adding Your Bank Account in Stripe (for Withdrawals)

Stripe Payouts send funds from your Stripe balance to a bank account you link. Here's how:

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click your name/business in the top-left → **Settings**
3. Under **Business settings**, click **Bank accounts and scheduling**
4. Click **+ Add bank account**
5. Enter your sort code and account number (UK) or routing + account number (US)
6. Stripe will make two small test deposits to verify. Once verified, payouts will automatically go to this account.

> **Important:** Stripe Payouts only work on **live mode** with a verified account. In test mode, payouts are simulated.

---

## Deploying to Railway (Backend + PostgreSQL)

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select this repository
4. Set the root directory to `vault/server`

### 2. Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway will create the database and provide a `DATABASE_URL`
3. Click the PostgreSQL service → **Connect** tab → copy the `DATABASE_URL`

### 3. Run migrations on Railway

Open the PostgreSQL service in Railway → **Data** tab → run the SQL from `db/migrations/001_initial.sql` and `db/seed.sql` in the query editor.

### 4. Set environment variables

In your Railway server service → **Variables** tab, add:

```
DATABASE_URL      = (auto-filled by Railway PostgreSQL plugin)
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
CLIENT_URL        = https://your-vault.vercel.app
PORT              = (Railway sets this automatically — don't override)
```

### 5. Deploy

Railway auto-deploys on every git push. Your API will be available at a `*.up.railway.app` URL.

---

## Deploying to Vercel (Frontend)

### 1. Import project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project** → import this GitHub repo
3. Set the **Root Directory** to `vault/client`
4. Framework preset: **Vite**

### 2. Set environment variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
VITE_API_URL                = https://your-api.up.railway.app
```

### 3. Deploy

Click **Deploy**. Vercel will build and deploy automatically.

### 4. Update Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
2. Endpoint URL: `https://your-api.up.railway.app/api/deposit/confirm`
3. Events to listen to: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the signing secret → add to Railway as `STRIPE_WEBHOOK_SECRET`

### 5. Update CORS

Set `CLIENT_URL` in Railway to your Vercel URL (e.g. `https://vault.vercel.app`).

---

## Installing as PWA on iPhone

1. Open Safari and navigate to your Vercel URL
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Name it **Vault** → tap **Add**
5. The app icon appears on your home screen and opens fullscreen

> On Android: open Chrome → tap the three-dot menu → **Add to Home screen**

---

## Generating PWA Icons

The SVG icon is at `client/public/icons/icon.svg`. To generate the required PNG sizes:

```bash
cd client/public
npm install sharp-cli -g
node generate-icons.js
```

This creates `icon-192.png` and `icon-512.png` in `client/public/icons/`.

---

## Viewing Your Data in pgAdmin

1. Download [pgAdmin 4](https://www.pgadmin.org/download/)
2. Open pgAdmin → right-click **Servers** → **Register** → **Server**
3. Name: `Vault`
4. Connection tab:
   - **Host**: from your `DATABASE_URL` (e.g. `containers-us-west-xxx.railway.app`)
   - **Port**: from your `DATABASE_URL` (usually `5432` or a custom Railway port)
   - **Database**: `railway` (or as specified in your DATABASE_URL)
   - **Username** / **Password**: from your `DATABASE_URL`
5. Click **Save**

Once connected:
- Expand **Servers → Vault → Databases → railway → Schemas → public → Tables**
- Right-click any table → **View/Edit Data → All Rows** to browse records

To run a custom query: **Tools → Query Tool**, then:

```sql
SELECT * FROM transactions ORDER BY created_at DESC;
SELECT * FROM accounts;
SELECT * FROM pots;
```

---

## API Reference

| Method | Route | Body | Description |
|---|---|---|---|
| `GET` | `/api/balance` | — | Returns current balance and currency |
| `GET` | `/api/transactions` | — | Transaction history (query: `limit`, `offset`) |
| `POST` | `/api/deposit/create-intent` | `{ amount: number }` | Creates Stripe PaymentIntent. Amount in **pence** |
| `POST` | `/api/deposit/confirm` | Stripe webhook body | Stripe webhook — confirms payment, credits balance |
| `POST` | `/api/withdraw` | `{ amount: number }` | Triggers Stripe Payout. Amount in **pounds** |
| `GET` | `/api/pots` | — | Returns all savings pots |
| `POST` | `/api/pots` | `{ name, target_amount, emoji }` | Creates a new pot |
| `PATCH` | `/api/pots/:id` | `{ action: 'add'|'withdraw', amount }` | Moves funds into or out of a pot |
| `DELETE` | `/api/pots/:id` | — | Deletes pot, returns funds to main balance |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + vite-plugin-pwa |
| Routing | React Router v6 |
| Payments (frontend) | @stripe/react-stripe-js |
| Backend | Node.js + Express |
| Database | PostgreSQL via `pg` |
| Payments (backend) | Stripe Node SDK |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
