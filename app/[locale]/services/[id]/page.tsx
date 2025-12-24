"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Star, CheckCircle, MapPin, Phone, Mail, MessageCircle } from "lucide-react";

interface Performer {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  performer_profile?: {
    company_name: string;
    description: string;
    price_per_hour: number;
    rating: number;
    total_reviews: number;
    work_examples: string[];
  };
}

export default function ServiceCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const t = useTranslations("common");
  const locale = useLocale();
  const supabase = createClient();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformers();
  }, []);

  const loadPerformers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, email, performer_profile:performer_profiles(*)"
      )
      .eq("role", "performer")
      .order("performer_profile(rating)", { ascending: false });

    if (error) {
      console.error("Error loading performers:", error);
    } else {
      setPerformers(
        (data || []).filter((p) => p.performer_profile !== null)
      );
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Лучшие специалисты в категории
        </h1>
        <p className="text-gray-600">
          Создай заказ бесплатно или посмотри цены
        </p>
      </div>

      <div className="mb-8">
        <Link
          href={`/${locale}/create-order`}
          className="btn-primary text-lg px-8 py-4"
        >
          {t("createOrderButton")}
        </Link>
      </div>

      <div className="space-y-6">
        {performers.map((performer) => (
          <div key={performer.id} className="card">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {performer.full_name?.[0] || "U"}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {performer.full_name}
                    </h3>
                    {performer.performer_profile?.company_name && (
                      <p className="text-gray-600 mb-2">
                        {performer.performer_profile.company_name}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {performer.performer_profile?.rating.toFixed(1) || "0.0"}{" "}
                        ({performer.performer_profile?.total_reviews || 0}{" "}
                        {t("reviews")})
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {t("nowOnline")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      PRO
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✓
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {performer.performer_profile?.description}
                </p>

                {performer.performer_profile?.price_per_hour && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("prices")}
                    </h4>
                    <p className="text-gray-700">
                      {performer.performer_profile.price_per_hour}€/час
                    </p>
                  </div>
                )}

                {performer.performer_profile?.work_examples &&
                  performer.performer_profile.work_examples.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {t("workExamples")}
                      </h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {performer.performer_profile.work_examples
                          .slice(0, 7)
                          .map((example, idx) => (
                            <div
                              key={idx}
                              className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"
                            >
                              <img
                                src={example}
                                alt={`Example ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-4">
                  <Link
                    href={`/${locale}/create-order`}
                    className="btn-primary"
                  >
                    {t("offerOrder")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {performers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Нет исполнителей в этой категории</p>
        </div>
      )}
    </div>
  );
}




