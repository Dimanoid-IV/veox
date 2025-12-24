"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface CustomerContactsProps {
  orderId: string;
  customer: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  hasAccess: boolean;
  offerAccepted?: boolean;
}

export function CustomerContacts({
  orderId,
  customer,
  hasAccess,
  offerAccepted = false,
}: CustomerContactsProps) {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  if (!hasAccess) {
    // Show button only if offer is accepted
    if (!offerAccepted) {
      return (
        <div className="card bg-gray-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Контакты заказчика</h3>
              <p className="text-sm text-gray-600">
                Дождитесь подтверждения вашего отклика заказчиком
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Контакты заказчика</h3>
            <p className="text-sm text-gray-600">
              Для просмотра контактов необходимо оплатить доступ
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            router.push(`/${locale}/performer/orders/${orderId}/purchase`);
          }}
          className="btn-primary w-full"
        >
          Получить контакты (5€)
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Контакты заказчика</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-700">
              {customer.full_name?.[0] || "З"}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{customer.full_name}</p>
          </div>
        </div>

        {customer.phone && customer.phone !== "***" && (
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-gray-900">{customer.phone}</span>
          </a>
        )}

        {customer.email && customer.email !== "***" && (
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-gray-900">{customer.email}</span>
          </a>
        )}

        <a
          href={`https://wa.me/${customer.phone?.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-green-600" />
          <span className="text-gray-900">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

