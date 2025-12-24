import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.type === "contact_purchase") {
      // Update contact purchase status
      const { error } = await supabase
        .from("contact_purchases")
        .update({ 
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("stripe_checkout_session_id", session.id);

      if (error) {
        console.error("Error updating contact purchase:", error);
      }

      // Create notification for customer
      const { data: order } = await supabase
        .from("orders")
        .select("customer_id, title")
        .eq("id", session.metadata.orderId)
        .single();

      if (order) {
        // In-app notification
        await supabase.from("notifications").insert({
          user_id: order.customer_id,
          type: "contact_purchased",
          title: "Кто-то купил доступ к вашим контактам",
          message: `Исполнитель получил доступ к вашим контактным данным для заказа "${order.title}".`,
          link: `/orders/${session.metadata.orderId}`,
        });

        // Email notification (will be implemented in email service)
        // await sendEmailNotification(order.customer_id, "contact_purchased", { orderId: session.metadata.orderId });
      }
    }
  }

  return NextResponse.json({ received: true });
}

