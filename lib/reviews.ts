// Review system utilities

import { createClient } from "@/lib/supabase/client";

export async function canLeaveReview(
  orderId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  // Check if order is completed
  const { data: order } = await supabase
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "completed") {
    return false;
  }

  // Check if user is the customer
  if (order.customer_id !== userId) {
    return false;
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .eq("reviewer_id", userId)
    .single();

  return !existingReview;
}

export async function getPerformerRating(performerId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", performerId);

  if (!data || data.length === 0) {
    return { rating: 0, count: 0 };
  }

  const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / data.length;

  return {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    count: data.length,
  };
}

export async function getPerformerReviews(performerId: string, limit = 10) {
  const supabase = createClient();

  const { data } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name)
    `)
    .eq("reviewee_id", performerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}




