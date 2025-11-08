import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Fallback endpoint to create order from Stripe session if webhook failed
 * This is called from the success page as a backup
 */
export async function POST(req: Request) {
	try {
		let body;
		try {
			body = await req.json();
		} catch (error) {
			console.error("[CreateFromSession] Error parsing request body:", error);
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}
		
		const { session_id } = body;

		if (!session_id) {
			console.error("[CreateFromSession] Missing session_id in request");
			return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
		}
		
		console.log("[CreateFromSession] Received request for session:", session_id);

		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
		}

		const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-10-29.clover" });

		// Get session from Stripe
		const session = await stripe.checkout.sessions.retrieve(session_id, {
			expand: ["line_items"],
		});

		if (!session) {
			return NextResponse.json({ error: "Session not found" }, { status: 404 });
		}

		// Check if order already exists
		const supabase = getSupabaseServiceClient();
		const { data: existingOrder } = await supabase
			.from("orders")
			.select("id")
			.eq("stripe_payment_intent", session.payment_intent as string)
			.maybeSingle();

		if (existingOrder) {
			console.log("[CreateFromSession] Order already exists:", existingOrder.id);
			return NextResponse.json({ order_id: existingOrder.id, already_exists: true });
		}

		// Extract metadata
		const metadata = session.metadata as any;
		const userId = metadata?.user_id as string | undefined;
		const sessionId = metadata?.session_id as string | undefined;

		console.log("[CreateFromSession] Creating order from session:", {
			session_id,
			userId: userId || "guest",
			sessionId: sessionId || "none",
		});

		// Get user info
		let userEmail: string | null = null;
		if (userId) {
			const serverSupabase = await getSupabaseServerClient();
			const { data: auth } = await serverSupabase.auth.getUser();
			if (auth.user?.id === userId) {
				userEmail = auth.user.email || null;
			}
		}

		const customerEmail = session.customer_email || session.customer_details?.email || metadata?.customer_email || userEmail;
		const customerName = metadata?.customer_name || session.customer_details?.name;
		const customerPhone = metadata?.customer_phone;
		const shippingAddress = {
			line1: metadata?.shipping_address_line1 || session.shipping_details?.address?.line1,
			line2: metadata?.shipping_address_line2 || session.shipping_details?.address?.line2,
			city: metadata?.shipping_city || session.shipping_details?.address?.city,
			state: metadata?.shipping_state || session.shipping_details?.address?.state,
			postal_code: metadata?.shipping_postal_code || session.shipping_details?.address?.postal_code,
			country: metadata?.shipping_country || session.shipping_details?.address?.country,
		};

		// Find cart
		let cartId: string | null = null;
		if (userId) {
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("user_id", userId)
				.maybeSingle();
			cartId = cart?.id || null;
		} else if (sessionId) {
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("session_id", sessionId)
				.maybeSingle();
			cartId = cart?.id || null;
		}

		if (!cartId) {
			console.error("[CreateFromSession] Cart not found");
			// Try to create order from line items if cart is missing
			const lineItems = session.line_items?.data || [];
			if (lineItems.length === 0) {
				return NextResponse.json({ error: "Cart not found and no line items" }, { status: 400 });
			}

			// Create order from line items
			const amountCents = session.amount_total || 0;
			const orderData = {
				user_id: userId || null,
				guest_email: userId ? null : customerEmail || null,
				status: "pending",
				payment_status: "paid",
				stripe_payment_intent: session.payment_intent as string,
				amount_cents: amountCents,
				shipping_name: customerName || null,
				phone: customerPhone || null,
				shipping_address_line1: shippingAddress.line1 || null,
				shipping_address_line2: shippingAddress.line2 || null,
				shipping_city: shippingAddress.city || null,
				shipping_state: shippingAddress.state || null,
				shipping_postal_code: shippingAddress.postal_code || null,
				shipping_country: shippingAddress.country || null,
			};

			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert(orderData)
				.select("id")
				.single();

			if (orderError) {
				console.error("[CreateFromSession] Error creating order:", orderError);
				return NextResponse.json({ error: orderError.message }, { status: 500 });
			}

			// Create order items from line items (we'll need product IDs from metadata or name matching)
			// For now, we'll skip order items if cart is missing
			console.log("[CreateFromSession] Order created from line items (no cart):", order.id);
			return NextResponse.json({ order_id: order.id });
		}

		// Get cart items
		const { data: items, error: itemsError } = await supabase
			.from("cart_items")
			.select("quantity, product:products(id, name, price_cents)")
			.eq("cart_id", cartId);

		if (itemsError) {
			console.error("[CreateFromSession] Error fetching cart items:", {
				message: itemsError.message,
				code: itemsError.code,
				details: itemsError.details,
			});
			return NextResponse.json({ 
				error: "Cart items not found",
				details: itemsError.message 
			}, { status: 400 });
		}
		
		if (!items || items.length === 0) {
			console.error("[CreateFromSession] No cart items found for cart:", cartId);
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}
		
		console.log("[CreateFromSession] Found cart items:", items.length);

		// Calculate amounts
		const subtotalCents = items.reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);
		const finalAmountCents = session.amount_total || subtotalCents;

		// Create order
		const orderData = {
			user_id: userId || null,
			guest_email: userId ? null : customerEmail || null,
			status: "pending",
			payment_status: "paid",
			stripe_payment_intent: session.payment_intent as string,
			amount_cents: finalAmountCents,
			shipping_name: customerName || null,
			phone: customerPhone || null,
			shipping_address_line1: shippingAddress.line1 || null,
			shipping_address_line2: shippingAddress.line2 || null,
			shipping_city: shippingAddress.city || null,
			shipping_state: shippingAddress.state || null,
			shipping_postal_code: shippingAddress.postal_code || null,
			shipping_country: shippingAddress.country || null,
		};

		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert(orderData)
			.select("id")
			.single();

		if (orderError) {
			console.error("[CreateFromSession] Error creating order:", {
				message: orderError.message,
				code: orderError.code,
				details: orderError.details,
				hint: orderError.hint,
				orderData: JSON.stringify(orderData, null, 2),
			});
			return NextResponse.json({ 
				error: orderError.message || "Failed to create order",
				code: orderError.code,
				details: orderError.details,
			}, { status: 500 });
		}
		
		if (!order) {
			console.error("[CreateFromSession] Order insert returned no data");
			return NextResponse.json({ error: "Order creation returned no data" }, { status: 500 });
		}
		
		console.log("[CreateFromSession] Order created, ID:", order.id);

		// Create order items
		const { error: itemsInsertError } = await supabase.from("order_items").insert(
			items.map((it: any) => ({
				order_id: order.id,
				product_id: it.product.id,
				quantity: it.quantity,
				unit_price_cents: it.product.price_cents,
			}))
		);

		if (itemsInsertError) {
			console.error("[CreateFromSession] Error creating order items:", itemsInsertError);
			// Order is created, so we'll still return success
		}

		// Clear cart
		await supabase.from("cart_items").delete().eq("cart_id", cartId);

		console.log("[CreateFromSession] Order created successfully:", order.id);
		return NextResponse.json({ order_id: order.id });
	} catch (error: any) {
		console.error("[CreateFromSession] Unexpected error:", {
			message: error?.message,
			stack: error?.stack,
			name: error?.name,
			error,
		});
		return NextResponse.json({ 
			error: error?.message || "Internal server error",
			type: error?.name || "UnknownError",
		}, { status: 500 });
	}
}

