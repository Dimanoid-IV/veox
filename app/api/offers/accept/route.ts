import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { offer_id } = body;

    if (!offer_id) {
      return NextResponse.json(
        { error: "offer_id is required" },
        { status: 400 }
      );
    }

    // Get offer with order info
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select(`
        *,
        order:orders!inner(id, customer_id, title)
      `)
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Check if user is the customer for this order
    if (offer.order.customer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the order customer can accept offers" },
        { status: 403 }
      );
    }

    // Reject all other offers for this order
    await supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("order_id", offer.order_id)
      .neq("id", offer_id);

    // Accept this offer
    const { error: updateError } = await supabase
      .from("offers")
      .update({ status: "accepted" })
      .eq("id", offer_id);

    if (updateError) {
      console.error("Error accepting offer:", updateError);
      return NextResponse.json(
        { error: "Failed to accept offer" },
        { status: 500 }
      );
    }

    // Update order status
    await supabase
      .from("orders")
      .update({ status: "in_progress" })
      .eq("id", offer.order_id);

    // Create notification for performer
    const { data: performerProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", offer.performer_id)
      .single();

    await supabase.from("notifications").insert({
      user_id: offer.performer_id,
      type: "offer_accepted",
      title: "Ваше предложение принято",
      message: `Заказчик принял ваше предложение на заказ "${offer.order.title}"`,
      link: `/performer/orders/${offer.order_id}`,
    });

    // Send email notification (optional)
    try {
      if (performerProfile?.email) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: performerProfile.email,
            template: "offerAccepted",
            data: {
              performerName: performerProfile.full_name,
              orderTitle: offer.order.title,
              orderId: offer.order_id,
            },
          }),
        });
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
