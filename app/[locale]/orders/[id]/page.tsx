"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Calendar, Euro, User, MessageCircle, CheckCircle } from "lucide-react";
import CreateOfferModal from "@/components/orders/CreateOfferModal";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: string;
  created_at: string;
  category_id: string;
  customer_id: string;
  customer?: {
    full_name: string;
    phone?: string;
    email?: string;
  };
  category?: {
    name_ru: string;
    name_et: string;
  };
}

interface Offer {
  id: string;
  performer_id: string;
  price: number;
  message: string;
  status: string;
  created_at: string;
  performer?: {
    full_name: string;
    performer_profile?: {
      company_name: string;
      rating: number;
      total_reviews: number;
    };
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const t = useTranslations("common");
  const locale = useLocale();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPerformer, setIsPerformer] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [userOffer, setUserOffer] = useState<Offer | null>(null);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setCurrentUser(user);

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "performer") {
        setIsPerformer(true);
      } else if (profile?.role === "customer") {
        setIsCustomer(true);
      }

      // Get order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey(full_name, phone, email),
          category:categories(name_ru, name_et)
        `)
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        console.error("Error loading order:", orderError);
        setLoading(false);
        return;
      }
      setOrder(orderData);

      // If user is customer, get all offers
      if (profile?.role === "customer" && orderData.customer_id === user.id) {
        const { data: offersData } = await supabase
          .from("offers")
          .select(`
            *,
            performer:profiles!offers_performer_id_fkey(
              full_name,
              performer_profile:performer_profiles(company_name, rating, total_reviews)
            )
          `)
          .eq("order_id", orderId)
          .order("created_at", { ascending: false });

        if (offersData) {
          setOffers(offersData as Offer[]);
          
          // Find accepted offer
          const accepted = offersData.find((o: any) => o.status === "accepted");
          if (accepted) {
            setAcceptedOfferId(accepted.id);
          }
        }
      } else if (profile?.role === "performer") {
        // If user is performer, check if they have an offer
        const { data: userOfferData } = await supabase
          .from("offers")
          .select("*")
          .eq("order_id", orderId)
          .eq("performer_id", user.id)
          .single();

        if (userOfferData) {
          setUserOffer(userOfferData as Offer);
        }

        // Check if there's an accepted offer
        const { data: acceptedOfferData } = await supabase
          .from("offers")
          .select("id")
          .eq("order_id", orderId)
          .eq("status", "accepted")
          .single();

        if (acceptedOfferData) {
          setAcceptedOfferId(acceptedOfferData.id);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await fetch("/api/offers/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offerId }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept offer");
      }

      await loadData();
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert("Ошибка при принятии предложения");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Заказ не найден</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href={`/${locale}/performer/orders`}
          className="text-primary hover:text-primary-dark"
        >
          ← Назад к заказам
        </Link>
      </div>

      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{order.title}</h1>
        <p className="text-gray-700 mb-4">{order.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {order.location}
          </span>
          {order.budget && (
            <span className="flex items-center gap-1">
              <Euro className="w-4 h-4" />
              {order.budget}€
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(order.created_at).toLocaleDateString(locale === "ru" ? "ru-RU" : "et-EE")}
          </span>
          {order.category && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              {locale === "ru" ? order.category.name_ru : order.category.name_et}
            </span>
          )}
        </div>

        {isPerformer && !userOffer && order.status === "open" && (
          <div className="mt-6">
            <button
              onClick={() => setShowOfferModal(true)}
              className="btn-primary"
            >
              Откликнуться на заказ
            </button>
          </div>
        )}

        {isPerformer && userOffer && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Вы откликнулись на этот заказ
              </span>
              {userOffer.status === "accepted" && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Принято заказчиком
                </span>
              )}
            </div>
            {userOffer.price && (
              <p className="text-sm text-blue-800">Ваша цена: {userOffer.price}€</p>
            )}
            {userOffer.message && (
              <p className="text-sm text-blue-700 mt-1">{userOffer.message}</p>
            )}
          </div>
        )}
      </div>

      {isCustomer && offers.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Отклики ({offers.length})
          </h2>
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 border rounded ${
                  offer.status === "accepted"
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {offer.performer?.full_name}
                    </h3>
                    {offer.performer?.performer_profile?.company_name && (
                      <p className="text-sm text-gray-600">
                        {offer.performer.performer_profile.company_name}
                      </p>
                    )}
                    {offer.performer?.performer_profile && (
                      <div className="text-sm text-gray-600 mt-1">
                        ⭐ {offer.performer.performer_profile.rating.toFixed(1)} (
                        {offer.performer.performer_profile.total_reviews} отзывов)
                      </div>
                    )}
                  </div>
                  {offer.status === "accepted" && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Принято
                    </span>
                  )}
                </div>

                {offer.price && (
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {offer.price}€
                  </p>
                )}

                {offer.message && (
                  <p className="text-gray-700 mb-3">{offer.message}</p>
                )}

                {isCustomer &&
                  offer.status !== "accepted" &&
                  !acceptedOfferId && (
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="btn-primary"
                    >
                      Принять предложение
                    </button>
                  )}

                {isCustomer && offer.status === "accepted" && (
                  <Link
                    href={`/${locale}/orders/${orderId}/review`}
                    className="btn-outline"
                  >
                    Оставить отзыв
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        orderId={orderId}
        onSuccess={loadData}
      />
    </div>
  );
}
