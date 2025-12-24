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

    const { orderId, price, message } = await request.json();

    // Check if user is a performer
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "performer") {
      return NextResponse.json(
        { error: "Only performers can create offers" },
        { status: 403 }
      );
    }

    // Check if order exists and is open
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, title, customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "open") {
      return NextResponse.json(
        { error: "Order is not open" },
        { status: 400 }
      );
    }

    // Check if offer already exists
    const { data: existingOffer } = await supabase
      .from("offers")
      .select("id")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .single();

    if (existingOffer) {
      return NextResponse.json(
        { error: "You have already responded to this order" },
        { status: 400 }
      );
    }

    // Create offer
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .insert({
        order_id: orderId,
        performer_id: user.id,
        price: price || null,
        message: message,
        status: "pending",
      })
      .select()
      .single();

    if (offerError) {
      console.error("Error creating offer:", offerError);
      return NextResponse.json(
        { error: "Failed to create offer" },
        { status: 500 }
      );
    }

    // Create notification for customer
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      type: "new_offer",
      title: "Новый отклик на ваш заказ",
      message: `Исполнитель откликнулся на ваш заказ "${order.title}".`,
      link: `/orders/${orderId}`,
    });

    // Send email notification (optional, if email is configured)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "new_offer",
          userId: order.customer_id,
          data: {
            orderTitle: order.title,
            offerPrice: price || 0,
            orderId: orderId,
          },
          locale: "ru",
        }),
      });
    } catch (emailError) {
      // Email is optional, don't fail if it doesn't work
      console.warn("Failed to send email notification:", emailError);
    }

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

