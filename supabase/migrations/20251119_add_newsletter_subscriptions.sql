-- Migration to add newsletter subscriptions table

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	email text NOT NULL UNIQUE,
	discount_code text, -- The 10% discount code generated for this subscription
	subscribed_at timestamp with time zone DEFAULT now(),
	unsubscribed_at timestamp with time zone,
	active boolean DEFAULT true,
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON public.newsletter_subscriptions(active);

-- RLS Policies
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe), but only admins can read/update
CREATE POLICY "newsletter subscriptions insertable by all" ON public.newsletter_subscriptions
	FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter subscriptions readable by admin" ON public.newsletter_subscriptions
	FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "newsletter subscriptions updatable by admin" ON public.newsletter_subscriptions
	FOR UPDATE USING (public.is_admin(auth.uid()));

-- Function to generate unique discount code
CREATE OR REPLACE FUNCTION generate_newsletter_discount_code()
RETURNS text AS $$
DECLARE
	code text;
	exists_check boolean;
BEGIN
	LOOP
		-- Generate a random 8-character code (letters and numbers)
		code := upper(
			substring(
				md5(random()::text || clock_timestamp()::text),
				1, 8
			)
		);
		
		-- Check if code already exists in coupons table
		SELECT EXISTS(SELECT 1 FROM public.coupons WHERE public.coupons.code = code) INTO exists_check;
		
		-- If code doesn't exist, break the loop
		EXIT WHEN NOT exists_check;
	END LOOP;
	
	RETURN code;
END;
$$ LANGUAGE plpgsql;

