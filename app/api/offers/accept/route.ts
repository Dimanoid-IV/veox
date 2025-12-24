import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { offerId, orderId } = await request.json();

    // Get order and verify customer ownership
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customer_id !== user.id) {
      return NextResponse.json(
        { error: "Only order owner can accept offers" },
        { status: 403 }
      );
    }

    if (order.status !== "open") {
      return NextResponse.json(
        { error: "Order is not open" },
        { status: 400 }
      );
    }

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select("id, performer_id, status, order_id")
      .eq("id", offerId)
      .eq("order_id", orderId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { error: "Offer is not pending" },
        { status: 400 }
      );
    }

    // Start transaction: accept this offer and reject others
    // Accept the selected offer
    const { error: acceptError } = await supabase
      .from("offers")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", offerId);

    if (acceptError) {
      console.error("Error accepting offer:", acceptError);
      return NextResponse.json(
        { error: "Failed to accept offer" },
        { status: 500 }
      );
    }

    // Reject all other offers for this order
    await supabase
      .from("offers")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .neq("id", offerId)
      .eq("status", "pending");

    // Update order status to in_progress
    await supabase
      .from("orders")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    // Create notification for performer
    await supabase.from("notifications").insert({
      user_id: offer.performer_id,
      type: "offer_accepted",
      title: "Ваше предложение принято",
      message: `Заказчик принял ваше предложение на заказ. Теперь вы можете получить контакты заказчика.`,
      link: `/orders/${orderId}`,
    });

    // Send email notification (optional)
    try {
      const { data: orderDetails } = await supabase
        .from("orders")
        .select("title")
        .eq("id", orderId)
        .single();

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "offer_accepted",
          userId: offer.performer_id,
          data: {
            orderTitle: orderDetails?.title || "Заказ",
            orderId: orderId,
          },
          locale: "ru",
        }),
      });
    } catch (emailError) {
      console.warn("Failed to send email notification:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error accepting offer:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

