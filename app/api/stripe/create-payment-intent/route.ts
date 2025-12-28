import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount, locale = "ru" } = await request.json();

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("title, customer_id")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if performer has an accepted offer
    const { data: offer } = await supabase
      .from("offers")
      .select("status")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .single();

    if (!offer || offer.status !== "accepted") {
      return NextResponse.json(
        { error: "Your offer must be accepted by the customer first" },
        { status: 403 }
      );
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from("contact_purchases")
      .select("id")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .eq("status", "completed")
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    // Create unique checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/${locale}/performer/orders/${orderId}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/performer/orders/${orderId}/purchase`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Доступ к контактам заказчика: ${order.title}`,
              description: "Покупка доступа к контактным данным заказчика",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
        performerId: user.id,
        type: "contact_purchase",
      },
      customer_email: user.email || undefined,
    });

    // Create pending purchase record
    await supabase.from("contact_purchases").insert({
      order_id: orderId,
      performer_id: user.id,
      stripe_checkout_session_id: session.id,
      amount: amount / 100, // Convert from cents
      status: "pending",
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

