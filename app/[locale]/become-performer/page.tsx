"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function BecomePerformerPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleBecomePerformer = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // Update user role to performer
    const { error } = await supabase
      .from("profiles")
      .update({ role: "performer" })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating role:", error);
      alert("Ошибка при обновлении профиля");
    } else {
      router.push(`/${locale}/performer/profile`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t("becomePerformer")}
        </h1>

        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Преимущества работы на VEOX
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Большой поток заказов</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Гибкий график работы</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Прямой контакт с заказчиками</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Система рейтингов и отзывов</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Быстрая оплата</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Как это работает
            </h2>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li>Заполните профиль исполнителя</li>
              <li>Просматривайте доступные заказы</li>
              <li>Оплатите доступ к контактам заказчика (5€)</li>
              <li>Свяжитесь с заказчиком и выполните работу</li>
              <li>Получайте отзывы и повышайте рейтинг</li>
            </ol>
          </div>
        </div>

        <button
          onClick={handleBecomePerformer}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Обработка..." : "Стать исполнителем"}
        </button>
      </div>
    </div>
  );
}




