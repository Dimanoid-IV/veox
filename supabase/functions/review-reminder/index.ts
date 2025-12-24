// Supabase Edge Function to send review reminders
// Deploy: supabase functions deploy review-reminder

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find orders completed 7 days ago that don't have reviews yet
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        title,
        customer_id,
        updated_at,
        profiles!orders_customer_id_fkey(email, id),
        reviews(id)
      `)
      .eq("status", "completed")
      .lte("updated_at", sevenDaysAgo.toISOString())
      .is("reviews.id", null);

    if (error) {
      throw error;
    }

    const results = [];

    for (const order of orders || []) {
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("order_id", order.id)
        .eq("reviewer_id", order.customer_id)
        .single();

      if (existingReview) continue;

      // Send email reminder
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "VEOX <noreply@veox.ee>",
          to: order.profiles.email,
          subject: "Оставьте отзыв о выполненном заказе",
          html: `
            <h1>Помогите другим выбрать исполнителя</h1>
            <p>Заказ "${order.title}" был выполнен 7 дней назад. Пожалуйста, оставьте отзыв о работе исполнителя.</p>
            <a href="${APP_URL}/ru/orders/${order.id}/review">Оставить отзыв</a>
          `,
        }),
      });

      results.push({
        orderId: order.id,
        emailSent: emailResponse.ok,
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});




