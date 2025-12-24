"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { HowItWorks as HowItWorksComponent } from "@/components/home/HowItWorks";

export default function HowItWorksPage() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        {t("howItWorks")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("forCustomer")}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("step1")}
                </h3>
                <p className="text-gray-600">{t("step1Desc")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("step2")}
                </h3>
                <p className="text-gray-600">{t("step2Desc")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("step3")}
                </h3>
                <p className="text-gray-600">{t("step3Desc")}</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link href={`/${locale}/create-order`} className="btn-primary">
              {t("createOrder")}
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("forPerformer")}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Зарегистрируйтесь как исполнитель
                </h3>
                <p className="text-gray-600">
                  Создайте профиль и укажите свои услуги
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Просматривайте заказы
                </h3>
                <p className="text-gray-600">
                  Ищите подходящие заказы в вашей категории
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Получите контакты
                </h3>
                <p className="text-gray-600">
                  Оплатите доступ к контактам заказчика
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Выполните заказ
                </h3>
                <p className="text-gray-600">
                  Свяжитесь с заказчиком и выполните работу
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href={`/${locale}/become-performer`}
              className="btn-primary"
            >
              {t("becomePerformer")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




