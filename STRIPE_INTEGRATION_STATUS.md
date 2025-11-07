# Stripe Integration Status for Coupons & Gift Cards

## Current Implementation

### Coupons
**Partial Integration:**
- ✅ **Created in Stripe**: When you create a coupon in the admin panel, it automatically creates a corresponding Stripe Coupon object
- ✅ **Stored in Database**: The `stripe_coupon_id` is saved in our database
- ❌ **Not Used in Checkout**: The Stripe coupon is NOT actually applied during checkout
- ✅ **Manual Discount Applied**: Instead, we calculate the discount ourselves and apply it as a **negative line item** in the Stripe Checkout Session

**Why?**
- Stripe Checkout Sessions don't easily support applying coupons via API with complex conditions (product-specific, category-specific, etc.)
- Our coupon system has Shopify-like conditions that Stripe coupons don't support natively
- We need custom validation logic (minimum purchase, first-time customer, etc.)

### Gift Cards
**No Stripe Integration:**
- ❌ **Not in Stripe**: Gift cards exist only in our database
- ✅ **Manual Discount Applied**: Applied as a **negative line item** in the Stripe Checkout Session
- ✅ **Balance Tracked**: We track gift card balances and transactions in our database

## How It Works Currently

1. **User applies coupon/gift card** → Validated in our system
2. **Checkout** → Discount calculated and added as negative line item
3. **Stripe Checkout** → Shows final amount with discount
4. **Payment** → Stripe processes the discounted amount
5. **Webhook** → We track coupon usage and update gift card balances

## Benefits of Current Approach

✅ **Full Control**: We can implement any discount logic we want
✅ **Complex Conditions**: Support for product-specific, category-specific discounts
✅ **Custom Validation**: First-time customer, minimum purchase, etc.
✅ **Gift Cards**: Can track balances and transactions ourselves
✅ **Works**: Discounts are applied correctly in Stripe checkout

## Potential Improvements

If you want **full Stripe integration**, we could:

1. **Use Stripe Promotion Codes** (better for Checkout Sessions)
   - Create Promotion Codes linked to our coupons
   - Customers enter promotion codes in Stripe Checkout
   - Stripe handles the discount automatically
   - **Limitation**: Still can't do complex conditions like product-specific discounts

2. **Hybrid Approach** (Recommended)
   - Keep current system for complex coupons
   - Use Stripe Promotion Codes for simple coupons
   - Continue using manual line items for gift cards

## Current Status: ✅ Working As Intended

The system works correctly - discounts are applied in Stripe checkout and payments process correctly. The Stripe coupon creation is more for record-keeping and potential future use, but the actual discount application happens through our custom logic.

