# Stripe Webhook Setup Guide

## Problem
If orders are not being created after successful payment, the webhook is likely not configured or not receiving events.

## Solution 1: Local Development (Recommended)

### Step 1: Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe CLI
```bash
stripe login
```

### Step 3: Forward Webhooks to Local Server
In a **separate terminal**, run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Webhook Secret to .env.local
Copy the `whsec_...` value and add it to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Restart Your Dev Server
```bash
npm run dev
```

## Solution 2: Fallback Order Creation (Already Implemented)

If the webhook fails or isn't configured, the success page will automatically create the order as a fallback. This happens 2 seconds after the success page loads.

**How it works:**
1. User completes payment
2. Success page loads
3. After 2 seconds, checks if order exists
4. If not, creates order from Stripe session
5. Page refreshes to show the order

## Testing

### Test Webhook is Working
1. Complete a test checkout
2. Check your server console for:
   - `[Webhook] Event received: checkout.session.completed`
   - `[Webhook] Received checkout.session.completed event`
   - `[Webhook] Order created successfully: <order-id>`

### Test Fallback
1. Stop the `stripe listen` command (or remove STRIPE_WEBHOOK_SECRET)
2. Complete a test checkout
3. Wait 2 seconds on success page
4. Check browser console for:
   - `[SuccessPage] Order created from session: <order-id>`
5. Page should refresh and show the order

## Troubleshooting

### Issue: "Webhook secret not configured"
**Solution:** Add `STRIPE_WEBHOOK_SECRET` to `.env.local` from `stripe listen` output

### Issue: "Signature verification failed"
**Solution:** Make sure the webhook secret matches the one from `stripe listen`. Restart both `stripe listen` and your dev server.

### Issue: Webhook not receiving events
**Check:**
1. Is `stripe listen` running?
2. Is it forwarding to the correct URL?
3. Check Stripe Dashboard → Developers → Webhooks → Test mode
4. Look for failed webhook attempts

### Issue: Orders still not appearing
**Check:**
1. Visit `/api/debug/orders` to see if orders exist in database
2. Check server logs for webhook errors
3. Check browser console for fallback order creation
4. Verify user_id matches between checkout and orders query

## Production Setup

For production, you'll need to:
1. Add webhook endpoint in Stripe Dashboard
2. Use the webhook signing secret from Stripe Dashboard
3. Ensure your server is accessible from the internet (or use Stripe CLI for testing)

## Current Status

✅ **Fallback mechanism implemented** - Orders will be created even if webhook fails
✅ **Enhanced logging** - All webhook events are logged
✅ **Error handling** - Clear error messages for missing configuration

