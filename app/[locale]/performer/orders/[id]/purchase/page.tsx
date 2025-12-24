"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { Lock, CreditCard } from "lucide-react";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number | null;
}

export default function PurchaseContactsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const orderId = params.id as string;
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const CONTACT_PRICE = 5.0; // €5 to see customer contacts

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error loading order:", error);
      setLoading(false);
      return;
    }

    // Check if performer has an accepted offer
    const { data: offer } = await supabase
      .from("offers")
      .select("status")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .single();

    if (!offer || offer.status !== "accepted") {
      // Redirect back to order page if offer is not accepted
      router.push(`/${locale}/orders/${orderId}`);
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  const handlePurchase = async () => {
    setProcessing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from("contact_purchases")
      .select("*")
      .eq("order_id", orderId)
      .eq("performer_id", user.id)
      .eq("status", "completed")
      .single();

    if (existingPurchase) {
      router.push(`/${locale}/orders/${orderId}`);
      return;
    }

    // Create Stripe Checkout session
    const response = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount: CONTACT_PRICE * 100, // Convert to cents
        locale,
      }),
    });

    const { checkoutUrl, error } = await response.json();

    if (error || !checkoutUrl) {
      alert(error || "Ошибка при создании платежа");
      setProcessing(false);
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = checkoutUrl;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Заказ не найден</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Получить контакты заказчика
            </h1>
            <p className="text-gray-600">
              Чтобы связаться с заказчиком, необходимо оплатить доступ к
              контактам
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Информация о заказе
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Название:</span> {order.title}
            </p>
            <p>
              <span className="font-medium">Описание:</span> {order.description}
            </p>
            <p>
              <span className="font-medium">Местоположение:</span>{" "}
              {order.location}
            </p>
            {order.budget && (
              <p>
                <span className="font-medium">Бюджет:</span> {order.budget}€
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Стоимость доступа к контактам</span>
            <span className="text-2xl font-bold text-primary">
              {CONTACT_PRICE}€
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            После оплаты вы получите доступ к контактным данным заказчика и
            сможете связаться с ним напрямую.
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={processing}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {processing ? "Обработка..." : `Оплатить ${CONTACT_PRICE}€`}
        </button>
      </div>
    </div>
  );
}

