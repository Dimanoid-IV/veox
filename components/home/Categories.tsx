"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Truck, Home, Package, Trash2, Package2, Users } from "lucide-react";

const categories = [
  {
    id: "transport",
    icon: Truck,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "moving",
    icon: Home,
    color: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "movers",
    icon: Users,
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "wasteRemoval",
    icon: Trash2,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "couriers",
    icon: Package2,
    color: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    id: "privateCarriers",
    icon: Package,
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
];

export function Categories() {
  const t = useTranslations("categories");
  const locale = useLocale();

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/${locale}/services/${category.id}`}
                className={`${category.color} rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`}
              >
                <Icon className={`w-8 h-8 ${category.iconColor} mb-4`} />
                <h3 className="font-medium text-gray-900 text-sm">
                  {t(category.id)}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}




