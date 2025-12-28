"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Calendar, Euro, MessageCircle, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: string;
  created_at: string;
  category_id: string;
  customer_id: string;
  customer?: {
    full_name: string;
  };
  category?: {
    name_ru: string;
    name_et: string;
  };
  offer?: {
    id: string;
    status: string;
    price: number;
    message: string;
  };
  offer_accepted?: boolean;
  contact_purchased?: boolean;
}

export default function PerformerOrdersPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // Get all offers by this performer first
      const { data: offersData, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .eq("performer_id", user.id);

      if (offersError) {
        console.error("Error loading offers:", offersError);
      }

      const respondedOrderIds = (offersData || []).map((offer) => offer.order_id);

      // Get all open orders (excluding orders created by this performer)
      const { data: openOrdersData, error: openOrdersError } = await supabase
        .from("orders")
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey(full_name),
          category:categories(name_ru, name_et)
        `)
        .eq("status", "open")
        .neq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (openOrdersError) {
        console.error("Error loading open orders:", openOrdersError);
        setLoading(false);
        return;
      }

      // Get orders where performer has responded (even if not open anymore)
      let respondedOrdersData: any[] = [];
      if (respondedOrderIds.length > 0) {
        const { data, error: respondedOrdersError } = await supabase
          .from("orders")
          .select(`
            *,
            customer:profiles!orders_customer_id_fkey(full_name),
            category:categories(name_ru, name_et)
          `)
          .neq("customer_id", user.id)
          .in("id", respondedOrderIds)
          .order("created_at", { ascending: false });

        if (respondedOrdersError) {
          console.error("Error loading responded orders:", respondedOrdersError);
        } else if (data) {
          respondedOrdersData = data;
        }
      }

      // Combine all orders, avoiding duplicates
      const ordersMap = new Map<string, any>();

      // Add open orders
      (openOrdersData || []).forEach((order) => {
        ordersMap.set(order.id, order);
      });

      // Add responded orders (even if they're not open anymore)
      respondedOrdersData.forEach((order) => {
        ordersMap.set(order.id, order);
      });

      const allOrderIds = Array.from(ordersMap.keys());

      if (allOrderIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Get contact purchases by this performer for these orders
      const { data: contactPurchasesData, error: contactPurchasesError } = await supabase
        .from("contact_purchases")
        .select("order_id")
        .eq("performer_id", user.id)
        .eq("status", "completed")
        .in("order_id", allOrderIds);

      if (contactPurchasesError) {
        console.error("Error loading contact purchases:", contactPurchasesError);
      }

      // Create maps for quick lookup
      const offersMap = new Map();
      (offersData || []).forEach((offer) => {
        offersMap.set(offer.order_id, offer);
      });

      const purchasedOrderIds = new Set(
        (contactPurchasesData || []).map((cp) => cp.order_id)
      );

      // Combine orders with offers
      const ordersWithOffers = Array.from(ordersMap.values()).map((order) => {
        const offer = offersMap.get(order.id);
        const offerAccepted = offer?.status === "accepted" || false;
        const contactPurchased = purchasedOrderIds.has(order.id);

        return {
          ...order,
          offer: offer || undefined,
          offer_accepted: offerAccepted,
          contact_purchased: contactPurchased,
        };
      });

      // Sort by created_at descending
      ordersWithOffers.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("Loaded orders:", ordersWithOffers.length);
      setOrders(ordersWithOffers);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Доступные заказы
        </h1>
        <p className="text-gray-600">
          Просматривайте заказы и откликайтесь на интересующие вас
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {order.title}
                </h3>
                <p className="text-gray-700 mb-4">{order.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {order.location}
                  </span>
                  {order.budget && (
                    <span className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {order.budget}€
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.created_at).toLocaleDateString(locale === "ru" ? "ru-RU" : "et-EE")}
                  </span>
                  {order.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {locale === "ru" ? order.category.name_ru : order.category.name_et}
                    </span>
                  )}
                </div>

                {order.offer && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        Вы откликнулись
                      </span>
                      {order.offer.status === "accepted" && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Принято
                        </span>
                      )}
                    </div>
                    {order.offer.price && (
                      <p className="text-sm text-blue-800">
                        Ваша цена: {order.offer.price}€
                      </p>
                    )}
                    {order.offer.message && (
                      <p className="text-sm text-blue-700 mt-1">
                        {order.offer.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {!order.offer ? (
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="btn-primary"
                >
                  Откликнуться
                </Link>
              ) : order.offer.status === "accepted" ? (
                <>
                  {!order.contact_purchased ? (
                    <Link
                      href={`/${locale}/performer/orders/${order.id}/purchase`}
                      className="btn-primary"
                    >
                      Получить контакты
                    </Link>
                  ) : (
                    <Link
                      href={`/${locale}/orders/${order.id}`}
                      className="btn-outline"
                    >
                      Посмотреть заказ
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="btn-outline"
                >
                  Посмотреть заказ
                </Link>
              )}
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
