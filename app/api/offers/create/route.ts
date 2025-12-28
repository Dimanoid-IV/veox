import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const body = await request.json();
    const { order_id, price, message } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 }
      );
    }

    // Check if offer already exists
    const { data: existingOffer } = await supabase
      .from("offers")
      .select("id")
      .eq("order_id", order_id)
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
        order_id,
        performer_id: user.id,
        price: price || null,
        message: message || null,
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
    const { data: order } = await supabase
      .from("orders")
      .select("customer_id, title")
      .eq("id", order_id)
      .single();

    if (order) {
      await supabase.from("notifications").insert({
        user_id: order.customer_id,
        type: "new_offer",
        title: "Новый отклик на ваш заказ",
        message: `На ваш заказ "${order.title}" поступил новый отклик`,
        link: `/orders/${order_id}`,
      });

      // Send email notification (optional)
      try {
        const { data: customerProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", order.customer_id)
          .single();

        if (customerProfile?.email) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: customerProfile.email,
              template: "newOffer",
              data: {
                customerName: customerProfile.full_name,
                orderTitle: order.title,
                orderId: order_id,
              },
            }),
          });
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error in create offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

