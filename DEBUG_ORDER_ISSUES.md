# Debugging Order Creation Issues

## Changes Made

### 1. Enhanced Webhook Logging
- Added comprehensive logging at each step of order creation
- Logs include: session metadata, cart lookup, cart items, order data, and errors
- All errors now include full details (message, code, details, hint)

### 2. Fixed Order Status
- Changed initial order `status` from `"paid"` to `"pending"` 
- Payment status is tracked separately in `payment_status: "paid"`
- This aligns with the database constraint that allows both fields

### 3. Improved Error Handling
- Added error handling for cart item fetching
- Added validation to ensure order is created before proceeding
- Better error messages with full context

### 4. Added Debug Endpoint
- Created `/api/debug/orders` endpoint to check if orders exist in database
- Bypasses RLS using service client
- Useful for verifying if orders are being created at all

### 5. Enhanced Admin Orders API Logging
- Added logging for fetched orders count and filters
- Better error logging with full error details

## How to Debug

### Step 1: Check if Orders Exist
Visit: `http://localhost:3000/api/debug/orders`

This will show:
- Count of orders in database
- First 10 orders with all fields

### Step 2: Check Webhook Logs
When a payment is completed, check your server console for:
- `[Webhook] Received checkout.session.completed event`
- `[Webhook] Session metadata:` - Shows user_id, session_id, etc.
- `[Webhook] Found cart:` - Confirms cart was found
- `[Webhook] Cart items:` - Shows items being ordered
- `[Webhook] Creating order:` - Shows order data before insert
- `[Webhook] Order created successfully:` - Confirms order ID

### Step 3: Check Admin Orders API
Check server console for:
- `[Admin Orders API] Fetched orders:` - Shows count and filters

### Step 4: Verify Webhook is Being Called
1. Complete a test checkout
2. Check Stripe Dashboard → Webhooks → Events
3. Verify `checkout.session.completed` events are being sent
4. Check if webhook responses are 200 OK

### Step 5: Check Database Directly
If using local Supabase:
```bash
supabase db reset  # Only if you want to start fresh
# Then check orders table
```

## Common Issues

### Issue: Orders not appearing in admin dashboard
**Possible causes:**
1. Webhook not being called (check Stripe dashboard)
2. Webhook failing silently (check server logs)
3. RLS blocking admin access (should use service client - already fixed)
4. Orders being created but with wrong status (check debug endpoint)

### Issue: "Cart not found" error
**Possible causes:**
1. Cart cleared before webhook runs
2. Wrong user_id or session_id in metadata
3. Cart doesn't exist for that user/session

**Solution:** Check webhook logs for `userId` and `sessionId` values

### Issue: Order creation fails
**Possible causes:**
1. Invalid status value (should be "pending", "processing", etc.)
2. Missing required fields (user_id OR guest_email must be set)
3. Database constraint violation

**Solution:** Check webhook error logs for full error details

## Testing Checklist

- [ ] Complete a test checkout as logged-in user
- [ ] Complete a test checkout as guest
- [ ] Check `/api/debug/orders` - should show orders
- [ ] Check `/admin/orders` - should show all orders
- [ ] Check `/orders` (when logged in) - should show user's orders
- [ ] Verify webhook logs show successful order creation
- [ ] Verify order items are created correctly

## Next Steps

1. **Test the flow**: Complete a test checkout and check the logs
2. **Check debug endpoint**: Visit `/api/debug/orders` to see if orders exist
3. **Review webhook logs**: Look for any errors during order creation
4. **Verify admin dashboard**: Check if orders appear in `/admin/orders`

If orders still don't appear, the enhanced logging will show exactly where the process is failing.

