import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { type, userId, data, locale = "ru" } = await request.json();

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 });
    }

    let emailContent;

    switch (type) {
      case "customer_registration":
        emailContent = emailTemplates.customerRegistration(locale as "ru" | "et");
        break;
      case "performer_registration":
        emailContent = emailTemplates.performerRegistration(locale as "ru" | "et");
        break;
      case "new_offer":
        emailContent = emailTemplates.newOffer(
          locale as "ru" | "et",
          data.orderTitle,
          data.offerPrice || 0,
          data.orderId
        );
        break;
      case "offer_accepted":
        emailContent = emailTemplates.offerAccepted(
          locale as "ru" | "et",
          data.orderTitle,
          data.orderId
        );
        break;
      case "review_reminder":
        emailContent = emailTemplates.reviewReminder(
          locale as "ru" | "et",
          data.orderTitle,
          data.orderId
        );
        break;
      case "new_order_in_category":
        emailContent = emailTemplates.newOrderInCategory(
          locale as "ru" | "et",
          data.orderTitle,
          data.orderId
        );
        break;
      case "contact_purchase_success":
        emailContent = emailTemplates.contactPurchaseSuccess(
          locale as "ru" | "et",
          data.orderTitle,
          data.orderId
        );
        break;
      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    const result = await sendEmail({
      to: profile.email,
      subject: emailContent.subject,
      html: emailContent.html,
      locale: locale as "ru" | "et",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

