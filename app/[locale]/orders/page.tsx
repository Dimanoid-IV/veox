"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Eye, Clock, CheckCircle } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number | null;
  status: string;
  created_at: string;
  category?: {
    name_ru: string;
  };
}

export default function OrdersPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get all orders for this customer (both open and in_progress)
      const { data, error } = await supabase
        .from("orders")
        .select("*, category:categories(name_ru)")
        .eq("customer_id", user.id)
        .in("status", ["open", "in_progress", "completed"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.warn("Supabase not configured:", error);
      // Show empty state if Supabase is not configured
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t("allOrders")}
          </h1>

          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/orders/${order.id}`}
                className="card hover:shadow-md transition-shadow block"
              >
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
                        {order.budget
                          ? `${order.budget}€`
                          : t("notSpecified")}
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
                  <div className="ml-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {t("open")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Нет открытых заказов</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">
              {t("categories")}
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Транспортные услуги
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Переезды
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Грузчики
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary font-medium"
                >
                  {t("allOrders")}
                </a>
              </li>
            </ul>
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {t("location")}
            </h2>
            <input
              type="text"
              className="input mb-4"
              placeholder="Укажите город, район..."
            />
            <input
              type="range"
              min="0"
              max="100"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

