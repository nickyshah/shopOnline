-- Migration to add coupons and gift cards tables

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	description text,
	discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
	discount_value integer NOT NULL CHECK (discount_value > 0),
	-- Conditions
	minimum_purchase_cents integer DEFAULT 0,
	maximum_discount_cents integer,
	usage_limit integer,
	usage_count integer DEFAULT 0,
	user_limit integer DEFAULT 1, -- How many times a single user can use it
	-- Validity
	valid_from timestamp with time zone DEFAULT now(),
	valid_until timestamp with time zone,
	active boolean DEFAULT true,
	-- Applies to
	applies_to text DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'categories')),
	applies_to_ids text[], -- Array of product or category IDs
	-- Other
	first_time_customer_only boolean DEFAULT false,
	stripe_coupon_id text, -- Stripe coupon ID for integration
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

-- Gift cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	initial_amount_cents integer NOT NULL CHECK (initial_amount_cents > 0),
	remaining_amount_cents integer NOT NULL CHECK (remaining_amount_cents >= 0),
	-- Validity
	valid_from timestamp with time zone DEFAULT now(),
	valid_until timestamp with time zone,
	active boolean DEFAULT true,
	-- Tracking
	created_by uuid REFERENCES auth.users(id),
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

-- Gift card usage history
CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	gift_card_id uuid NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
	order_id uuid REFERENCES public.orders(id),
	amount_cents integer NOT NULL CHECK (amount_cents > 0),
	transaction_type text NOT NULL CHECK (transaction_type IN ('redeemed', 'refunded')),
	created_at timestamp with time zone DEFAULT now()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS public.coupon_usage (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
	user_id uuid REFERENCES auth.users(id),
	order_id uuid REFERENCES public.orders(id),
	used_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_active ON public.gift_cards(active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);

-- RLS Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons: public read (for checking validity), admin write
CREATE POLICY "coupons readable by all" ON public.coupons
	FOR SELECT USING (true);

CREATE POLICY "coupons writable by admin" ON public.coupons
	FOR ALL USING (public.is_admin(auth.uid()));

-- Gift cards: users can read their own, admin can read all
CREATE POLICY "gift cards readable by owner or admin" ON public.gift_cards
	FOR SELECT USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "gift cards writable by admin" ON public.gift_cards
	FOR ALL USING (public.is_admin(auth.uid()));

-- Gift card transactions: readable by owner or admin
CREATE POLICY "gift card transactions readable by owner or admin" ON public.gift_card_transactions
	FOR SELECT USING (
		EXISTS (
			SELECT 1 FROM public.gift_cards 
			WHERE gift_cards.id = gift_card_transactions.gift_card_id 
			AND (gift_cards.created_by = auth.uid() OR public.is_admin(auth.uid()))
		)
	);

-- Coupon usage: readable by owner or admin
CREATE POLICY "coupon usage readable by owner or admin" ON public.coupon_usage
	FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON public.gift_cards
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

