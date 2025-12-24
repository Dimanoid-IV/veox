"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Facebook, Youtube, Instagram, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    } catch (error) {
      // Supabase not configured, skip auth
      console.warn("Supabase not configured:", error);
    }
  }, []);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => switchLocale("et")}
                className={`text-sm font-medium ${
                  locale === "et" ? "text-primary" : "text-gray-600"
                } hover:text-primary transition-colors`}
              >
                EE
              </button>
              <button
                onClick={() => switchLocale("ru")}
                className={`text-sm font-medium ${
                  locale === "ru" ? "text-primary" : "text-gray-600"
                } hover:text-primary transition-colors`}
              >
                RU
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Truck className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-secondary">
                {t("logo")}
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href={`/${locale}/how-it-works`}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                {t("howItWorks")}
              </Link>
              <Link
                href={`/${locale}/orders`}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                {t("orders")}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                {t("services")}
              </Link>
              <Link
                href={`/${locale}/create-order`}
                className="btn-secondary text-sm"
              >
                {t("createOrder")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href={`/${locale}/become-performer`}
              className="text-gray-700 hover:text-primary font-medium transition-colors hidden md:block"
            >
              {t("becomePerformer")}
            </Link>
            {user && <NotificationBell />}
            {user ? (
              <Link
                href={`/${locale}/profile`}
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {t("profile")}
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-accent hover:text-accent-dark font-medium transition-colors"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

