"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Upload, Calendar, Euro } from "lucide-react";

export default function CreateOrderPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      alert("Ошибка при создании заказа");
      setLoading(false);
    } else {
      router.push(`/${locale}/orders/${order.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">
              1
            </div>
            <p className="text-sm font-medium text-gray-900">{t("step1")}</p>
            <p className="text-xs text-gray-600">{t("step1Desc")}</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center opacity-50">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mb-2">
              2
            </div>
            <p className="text-sm font-medium text-gray-600">{t("step2")}</p>
            <p className="text-xs text-gray-500">{t("step2Desc")}</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center opacity-50">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mb-2">
              3
            </div>
            <p className="text-sm font-medium text-gray-600">{t("step3")}</p>
            <p className="text-xs text-gray-500">{t("step3Desc")}</p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("fillApplication")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("brieflyDescribe")} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input"
                placeholder="Например: Перевозка мебели из Таллинна в Тарту"
              />
              <p className="mt-1 text-sm text-gray-500">
                Ремонт транспорта / Ремонт автоэлектрики / Услуги автоэлектрика
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("describeInDetail")} *
              </label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Ваш заказ будет опубликован на портале и доступен публично.
                  Пожалуйста не оставляйте личные данные в этом поле.
                </p>
              </div>
              <textarea
                required
                rows={8}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea"
                placeholder={t("specifyConditions")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("locationRequired")} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="input pl-10"
                  placeholder={t("addressOrArea")}
                />
              </div>
              <label className="mt-2 flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">
                  {t("useMyLocation")}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("uploadFiles")}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">{t("uploadFiles")}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="flex items-center gap-2 btn-outline"
              >
                <Euro className="w-5 h-5" />
                {t("budget")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                {loading ? "Создание..." : t("start")}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {t("priceCalculator")}
              <span className="text-gray-400">?</span>
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Заполнив форму, Вы получите примерную цену на подобные услуги на
              VEOX
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("service")}</p>
                <p className="font-medium text-gray-900">Услуги автоэлектрика</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t("approximateCost")}
                </p>
                <p className="text-2xl font-bold text-gray-900">0,00€</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {t("cannotSpecifyPrice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




