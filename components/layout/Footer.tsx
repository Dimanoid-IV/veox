"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-secondary mb-4">
              {t("logo")}
            </h3>
            <p className="text-sm text-gray-600">{t("tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("howItWorks")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary">
                  {t("forCustomer")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t("forPerformer")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("services")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary">
                  {t("allServices")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t("allOrders")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Контакты</h4>
            <p className="text-sm text-gray-600">info@veox.ee</p>
            <p className="text-sm text-gray-600">+372 XXX XXXX</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} VEOX. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}




