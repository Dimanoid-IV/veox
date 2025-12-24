"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Truck, Home, Package, Trash2, Package2, Users } from "lucide-react";

const services = [
  {
    id: "transport",
    name: "Транспортные услуги",
    icon: Truck,
    image: "/images/transport.jpg",
  },
  {
    id: "moving",
    name: "Переезды",
    icon: Home,
    image: "/images/moving.jpg",
  },
  {
    id: "movers",
    name: "Грузчики",
    icon: Users,
    image: "/images/movers.jpg",
  },
  {
    id: "wasteRemoval",
    name: "Вывоз мусора",
    icon: Trash2,
    image: "/images/waste.jpg",
  },
  {
    id: "couriers",
    name: "Курьеры",
    icon: Package2,
    image: "/images/couriers.jpg",
  },
  {
    id: "privateCarriers",
    name: "Частные и фирмы-перевозчики",
    icon: Package,
    image: "/images/carriers.jpg",
  },
];

export default function ServicesPage() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t("allServices")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.id}
              href={`/${locale}/services/${service.id}`}
              className="card hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                <Icon className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}




