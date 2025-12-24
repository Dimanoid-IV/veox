"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Save, Upload } from "lucide-react";

interface PerformerProfile {
  id?: string;
  performer_id: string;
  company_name: string;
  description: string;
  price_per_hour: number;
  work_examples: string[];
}

export default function PerformerProfilePage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PerformerProfile>({
    company_name: "",
    description: "",
    price_per_hour: 0,
    work_examples: [],
    performer_id: "",
  });

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

    // Update user role to performer if not already
    await supabase
      .from("profiles")
      .update({ role: "performer" })
      .eq("id", user.id);

    const { data, error } = await supabase
      .from("performer_profiles")
      .select("*")
      .eq("performer_id", user.id)
      .single();

    if (data) {
      setProfile({ ...data, performer_id: user.id });
    } else {
      setProfile({ ...profile, performer_id: user.id });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase.from("performer_profiles").upsert({
      performer_id: profile.performer_id,
      company_name: profile.company_name,
      description: profile.description,
      price_per_hour: profile.price_per_hour,
      work_examples: profile.work_examples,
    });

    if (error) {
      console.error("Error saving profile:", error);
      alert("Ошибка при сохранении");
    } else {
      alert("Профиль сохранен!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Профиль исполнителя
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название компании (необязательно)
            </label>
            <input
              type="text"
              value={profile.company_name}
              onChange={(e) =>
                setProfile({ ...profile, company_name: e.target.value })
              }
              className="input"
              placeholder="Название вашей компании"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              rows={6}
              value={profile.description}
              onChange={(e) =>
                setProfile({ ...profile, description: e.target.value })
              }
              className="textarea"
              placeholder="Расскажите о себе и своих услугах"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за час (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={profile.price_per_hour}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  price_per_hour: parseFloat(e.target.value) || 0,
                })
              }
              className="input"
              placeholder="40.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Примеры работ (URL изображений, по одному на строку)
            </label>
            <textarea
              rows={4}
              value={profile.work_examples.join("\n")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  work_examples: e.target.value.split("\n").filter((v) => v),
                })
              }
              className="textarea"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "Сохранение..." : "Сохранить профиль"}
          </button>
        </div>
      </div>
    </div>
  );
}




