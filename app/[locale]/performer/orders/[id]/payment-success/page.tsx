"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const orderId = params.id as string;
  const paymentIntentId = searchParams.get("payment_intent");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Check if payment was successful by checking the contact_purchase record
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const sessionId = searchParams.get("session_id");

    const { data, error } = await supabase
      .from("contact_purchases")
      .select("*")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .or(
        sessionId
          ? `stripe_checkout_session_id.eq.${sessionId},status.eq.completed`
          : "status.eq.completed"
      )
      .single();

    if (data && data.status === "completed") {
      setVerified(true);
    } else if (data && data.status === "pending") {
      // Payment might still be processing, check again in a moment
      setTimeout(() => verifyPayment(), 2000);
    } else {
      console.error("Payment verification failed:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <p>Проверка платежа...</p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Платеж обрабатывается
          </h1>
          <p className="text-gray-600 mb-6">
            Ваш платеж обрабатывается. Пожалуйста, подождите...
          </p>
          <button
            onClick={() => router.push(`/${locale}/performer/orders`)}
            className="btn-primary"
          >
            Вернуться к заказам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Платеж успешен!
        </h1>
        <p className="text-gray-600 mb-8">
          Теперь у вас есть доступ к контактным данным заказчика.
        </p>
        <button
          onClick={() => router.push(`/${locale}/orders/${orderId}`)}
          className="btn-primary"
        >
          Просмотреть контакты
        </button>
      </div>
    </div>
  );
}

