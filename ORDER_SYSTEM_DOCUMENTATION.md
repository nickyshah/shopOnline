# Order System Documentation

## Overview

The order system supports both authenticated users and guest checkout, with comprehensive order management for admins and order tracking for customers.

## Database Schema

### Orders Table

```sql
orders (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id), -- NULL for guest orders
  guest_email text, -- Required if user_id is NULL
  status text DEFAULT 'pending', -- pending | processing | paid | fulfilled | shipped | completed | cancelled | refunded
  payment_status text DEFAULT 'unpaid', -- unpaid | paid | refunded | failed
  amount_cents integer NOT NULL,
  shipping_name text,
  phone text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,
  stripe_payment_intent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Order Items Table

```sql
order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0)
)
```

## API Endpoints

### User Endpoints

#### `GET /api/orders`
Get orders for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by order status
- `limit` (optional, default: 50): Number of orders to return
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "status": "paid",
      "payment_status": "paid",
      "amount_cents": 5000,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "order_items": [...]
    }
  ]
}
```

#### `GET /api/orders/[id]`
Get a specific order by ID (authenticated users only).

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "status": "paid",
    "payment_status": "paid",
    "amount_cents": 5000,
    "shipping_name": "John Doe",
    "phone": "+1234567890",
    "shipping_address_line1": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_postal_code": "10001",
    "shipping_country": "US",
    "order_items": [...]
  }
}
```

#### `POST /api/orders/guest/lookup`
Look up a guest order by order ID and email/phone.

**Request Body:**
```json
{
  "orderId": "uuid",
  "email": "customer@example.com", // Optional if phone provided
  "phone": "+1234567890" // Optional if email provided
}
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "guest_email": "customer@example.com",
    "status": "paid",
    "payment_status": "paid",
    "amount_cents": 5000,
    "order_items": [...]
  }
}
```

### Admin Endpoints

#### `GET /api/admin/orders`
Get all orders (admin only) with filters.

**Query Parameters:**
- `status` (optional): Filter by order status
- `payment_status` (optional): Filter by payment status
- `start_date` (optional): Filter orders from this date (ISO format)
- `end_date` (optional): Filter orders until this date (ISO format)
- `limit` (optional, default: 100): Number of orders to return
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "orders": [...],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

#### `GET /api/admin/orders/[id]`
Get a specific order by ID (admin only).

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "user_id": "uuid" | null,
    "guest_email": "email@example.com" | null,
    "status": "paid",
    "payment_status": "paid",
    "amount_cents": 5000,
    "order_items": [...]
  }
}
```

#### `PUT /api/admin/orders/[id]`
Update order status (admin only).

**Request Body:**
```json
{
  "status": "processing", // Optional
  "payment_status": "paid" // Optional
}
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "status": "processing",
    "payment_status": "paid",
    ...
  }
}
```

## Order Creation Flow

1. **Checkout Page** (`/checkout`): User enters customer information (name, email, phone, address)
2. **Stripe Checkout**: Customer information is sent to Stripe Checkout API
3. **Payment Processing**: Stripe processes the payment
4. **Webhook** (`/api/stripe/webhook`): On `checkout.session.completed`:
   - Creates order with customer information
   - Links order to `user_id` if authenticated, or stores `guest_email`
   - Sets `payment_status` to "paid"
   - Creates order items from cart
   - Clears cart
   - Records coupon/gift card usage

## Order Status Values

- `pending`: Order created but not yet processed
- `processing`: Order is being prepared
- `paid`: Payment received (legacy, use payment_status instead)
- `fulfilled`: Order items prepared
- `shipped`: Order has been shipped
- `completed`: Order delivered and completed
- `cancelled`: Order cancelled
- `refunded`: Order refunded

## Payment Status Values

- `unpaid`: Payment not yet received
- `paid`: Payment successful
- `refunded`: Payment refunded
- `failed`: Payment failed

## Frontend Pages

### User Pages

- `/orders`: List of orders for authenticated users
- `/orders/track`: Guest order lookup page (order ID + email/phone)

### Admin Pages

- `/admin/orders`: All orders with filters and status updates
- `/admin/orders/[id]`: Order detail page (existing)

## Security

- **RLS Policies**: Orders are protected by Row Level Security
  - Users can only see their own orders
  - Admins can see all orders (using service client)
  - Guest orders are accessible via lookup endpoint with email/phone verification
- **API Authentication**: All endpoints verify user authentication and admin role
- **Service Client**: Admin operations use service role client to bypass RLS

## Testing

1. **Create a test order**:
   - Add items to cart
   - Go to checkout
   - Fill in customer information
   - Complete payment

2. **Verify order creation**:
   - Check `/admin/orders` (admin) or `/orders` (user)
   - Verify order appears with correct status

3. **Test guest lookup**:
   - Place order as guest
   - Go to `/orders/track`
   - Enter order ID and email/phone
   - Verify order details appear

4. **Test admin updates**:
   - Go to `/admin/orders`
   - Change order status using dropdown
   - Verify status updates


