"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Clock, Eye, Lock } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number | null;
  status: string;
  created_at: string;
  contact_purchased?: boolean;
  offer_accepted?: boolean;
  has_offer?: boolean;
}

export default function PerformerOrdersPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get orders where performer can respond or has responded (open or in_progress with their offer)
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error loading orders:", ordersError);
      setLoading(false);
      return;
    }

    // Check which orders have contact purchases
    const { data: purchases } = await supabase
      .from("contact_purchases")
      .select("order_id")
      .eq("performer_id", user.id)
      .eq("status", "completed");

    const purchasedOrderIds = new Set(
      purchases?.map((p) => p.order_id) || []
    );

    // Check which orders have accepted offers from this performer
    const { data: acceptedOffers } = await supabase
      .from("offers")
      .select("order_id, status")
      .eq("performer_id", user.id)
      .eq("status", "accepted");

    const acceptedOfferOrderIds = new Set(
      acceptedOffers?.map((o) => o.order_id) || []
    );

    // Check which orders have any offers from this performer (to hide "Respond" button)
    const { data: allOffers } = await supabase
      .from("offers")
      .select("order_id")
      .eq("performer_id", user.id);

    const ordersWithOffers = new Set(allOffers?.map((o) => o.order_id) || []);

    const ordersWithPurchaseStatus = (ordersData || []).map((order) => ({
      ...order,
      contact_purchased: purchasedOrderIds.has(order.id),
      offer_accepted: acceptedOfferOrderIds.has(order.id),
      has_offer: ordersWithOffers.has(order.id),
    }));

    setOrders(ordersWithPurchaseStatus);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Доступные заказы
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {order.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {order.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {order.budget ? `${order.budget}€` : t("notSpecified")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(order.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {order.location}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                {order.status === "open" && !order.has_offer && (
                  <Link
                    href={`/${locale}/orders/${order.id}`}
                    className="btn-secondary text-sm"
                  >
                    Откликнуться
                  </Link>
                )}
                {order.status === "open" && order.has_offer && !order.offer_accepted && (
                  <p className="text-sm text-gray-500">Ожидание ответа заказчика</p>
                )}
                {order.contact_purchased ? (
                  <Link
                    href={`/${locale}/orders/${order.id}`}
                    className="btn-primary text-sm"
                  >
                    Просмотреть контакты
                  </Link>
                ) : order.offer_accepted ? (
                  <Link
                    href={`/${locale}/performer/orders/${order.id}/purchase`}
                    className="btn-primary text-sm flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Получить контакты
                  </Link>
                ) : order.status === "in_progress" ? (
                  <p className="text-sm text-gray-500">Ожидание подтверждения</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Нет доступных заказов</p>
        </div>
      )}
    </div>
  );
}

