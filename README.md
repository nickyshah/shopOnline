This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Supabase CLI running locally (Docker) with the included `supabase/config.toml`
- Stripe CLI installed and logged in
- Node 18+

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note:** The Supabase URL port is `54331` (not 54321). After running `supabase start`, you can get the actual keys by running:
```bash
supabase status
```

This will show you:
- **API URL**: Use for `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key**: Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Secret key**: Use for `SUPABASE_SERVICE_ROLE_KEY` (this is the service role key for local development)

**Important:** The service role key is required for admin operations. Copy the "Secret key" from `supabase status` and add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Stripe Setup

1. **Get your test API keys:**
   - Run the helper script: `./get-stripe-keys.sh`
   - Or visit: https://dashboard.stripe.com/test/apikeys
   - Make sure you're in **Test mode** (toggle in top right)
   - Copy your **Secret key** (starts with `sk_test_`) and **Publishable key** (starts with `pk_test_`)

2. **Set up webhooks (local development):**
   In a separate terminal, forward webhooks:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `webhook signing secret` (starts with `whsec_`) and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

3. **Add to `.env.local`:**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Supabase local

Start Supabase services:

```
supabase start
```

Apply migrations (done automatically on start). To promote a user to admin, run in SQL editor:

```
update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
```
