"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { Star } from "lucide-react";
import { canLeaveReview } from "@/lib/reviews";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const orderId = params.id as string;
  const supabase = createClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [performer, setPerformer] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // Check if user can leave review
    const canReviewResult = await canLeaveReview(orderId, user.id);
    if (!canReviewResult) {
      router.push(`/${locale}/orders/${orderId}`);
      return;
    }
    setCanReview(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "*, offers!inner(performer_id, status, performer:profiles!offers_performer_id_fkey(id, full_name))"
      )
      .eq("id", orderId)
      .eq("customer_id", user.id)
      .eq("offers.status", "accepted")
      .single();

    if (error || !data) {
      console.error("Error loading order:", error);
      router.push(`/${locale}/orders`);
      return;
    }

    setOrder(data);
    if (data.offers && data.offers.length > 0) {
      setPerformer(data.offers[0].performer);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !performer) {
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: performer.id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      console.error("Error creating review:", error);
      alert("Ошибка при создании отзыва");
      setLoading(false);
      return;
    }

    // Update order status if needed
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    router.push(`/${locale}/orders/${orderId}`);
    setLoading(false);
  };

  if (!order || !performer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Оставить отзыв
        </h1>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Заказ: <span className="font-semibold">{order.title}</span>
          </p>
          <p className="text-gray-700">
            Исполнитель: <span className="font-semibold">{performer.full_name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Оценка *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий
            </label>
            <textarea
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea"
              placeholder="Расскажите о вашем опыте работы с исполнителем"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Отправка..." : "Отправить отзыв"}
          </button>
        </form>
      </div>
    </div>
  );
}

