"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { User, Mail, Phone, LogOut } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("profile")}</h1>
          <button
            onClick={handleLogout}
            className="btn-outline flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile.full_name || "Пользователь"}
              </h2>
              <p className="text-gray-600">{profile.role === "performer" ? "Исполнитель" : "Заказчик"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{profile.phone}</span>
              </div>
            )}
          </div>

          {profile.role === "performer" && (
            <div className="mt-8">
              <Link
                href={`/${locale}/performer/profile`}
                className="btn-primary"
              >
                Редактировать профиль исполнителя
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

