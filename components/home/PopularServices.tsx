"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";

export function PopularServices() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {t("popularServices")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder for popular services */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">
              Транспортные услуги
            </h3>
            <p className="text-sm text-gray-600">Перевозка грузов</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Переезды</h3>
            <p className="text-sm text-gray-600">Квартирные и офисные</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Грузчики</h3>
            <p className="text-sm text-gray-600">Погрузка и разгрузка</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Курьеры</h3>
            <p className="text-sm text-gray-600">Доставка документов</p>
          </div>
        </div>
      </div>
    </section>
  );
}




