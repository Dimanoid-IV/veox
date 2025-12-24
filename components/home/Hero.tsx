"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function Hero() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/orders?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t("findSpecialist")}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          33 734 {t("clientsFound")}
        </p>

        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("writeWhatNeeds")}
              className="input w-full pl-12 pr-4 py-4 text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            {t("find")}
          </button>
        </form>
      </div>
    </section>
  );
}




