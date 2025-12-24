"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, Eye } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { CustomerContacts } from "@/components/orders/CustomerContacts";
import { CreateOfferModal } from "@/components/orders/CreateOfferModal";

interface Order {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number | null;
  status: string;
  created_at: string;
  customer_id: string;
  customer?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

interface Offer {
  id: string;
  price: number;
  message: string;
  status: string;
  performer: {
    full_name: string;
    performer_profile?: {
      rating: number;
      total_reviews: number;
    };
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasContactAccess, setHasContactAccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadOffers();
    }
  }, [orderId]);

  const loadOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || null);

    const { data, error } = await supabase
      .from("orders")
      .select("*, customer:profiles!orders_customer_id_fkey(full_name, email, phone)")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error loading order:", error);
    } else {
      // Check contact access and user role
      if (user) {
        // Get user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setUserRole(profile?.role || null);

        if (data.customer_id === user.id) {
          // Customer can always see their own contacts
          setHasContactAccess(true);
        } else if (profile?.role === "performer") {
          // Check if performer purchased access
          const { data: purchase } = await supabase
            .from("contact_purchases")
            .select("id")
            .eq("order_id", orderId)
            .eq("performer_id", user.id)
            .eq("status", "completed")
            .single();

          setHasContactAccess(!!purchase);

          // Check if performer already has an offer and if it's accepted
          const { data: existingOffer } = await supabase
            .from("offers")
            .select("id, status")
            .eq("order_id", orderId)
            .eq("performer_id", user.id)
            .single();

          setHasExistingOffer(!!existingOffer);
          setOfferAccepted(existingOffer?.status === "accepted");
        }
      }
      setOrder(data);
    }
    setLoading(false);
  };

  const loadOffers = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("offers")
        .select(
          "*, performer:profiles!offers_performer_id_fkey(full_name, performer_profile:performer_profiles(rating, total_reviews))"
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading offers:", error);
      } else {
        setOffers(data || []);
      }
    } catch (error) {
      console.warn("Supabase not configured:", error);
    }
  };

  const handleOfferSuccess = () => {
    loadOffers();
    loadOrder();
    setHasExistingOffer(true);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await fetch("/api/offers/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId,
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Ошибка при принятии предложения");
        return;
      }

      // Reload offers and order to reflect changes
      loadOffers();
      loadOrder();
      alert("Предложение принято!");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{order.title}</h1>
        <p className="text-gray-700 whitespace-pre-line mb-6">
          {order.description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {order.budget ? `${order.budget}€` : "Не указан"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeAgo(order.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {order.location}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {offers.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Предложения ({offers.length})
              </h2>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`border rounded-lg p-4 ${
                      offer.status === "accepted"
                        ? "border-green-500 bg-green-50"
                        : offer.status === "rejected"
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {offer.performer.full_name}
                          </h3>
                          {offer.status === "accepted" && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                              Принято
                            </span>
                          )}
                          {offer.status === "rejected" && (
                            <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded">
                              Отклонено
                            </span>
                          )}
                        </div>
                        {offer.performer.performer_profile && (
                          <p className="text-sm text-gray-600">
                            ⭐ {offer.performer.performer_profile.rating} (
                            {offer.performer.performer_profile.total_reviews}{" "}
                            отзывов)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {offer.price ? `${offer.price}€` : "Цена договорная"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{offer.message}</p>
                    {userRole === "customer" &&
                      order?.status === "open" &&
                      offer.status === "pending" && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="btn-primary"
                        >
                          Принять предложение
                        </button>
                      )}
                    {offer.status === "accepted" && (
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Это предложение принято
                      </p>
                    )}
                    {offer.status === "rejected" && (
                      <p className="text-sm text-gray-500">
                        Это предложение отклонено
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {order && currentUserId && (
            <>
              {userRole === "performer" &&
                !hasExistingOffer &&
                (order.status === "open" || order.status === "in_progress") && (
                <div className="card mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Хотите откликнуться?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Предложите свою цену и условия выполнения заказа
                  </p>
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="btn-primary w-full"
                  >
                    Откликнуться на заказ
                  </button>
                </div>
              )}
              {userRole === "performer" && hasExistingOffer && (
                <div className="card mb-6 bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ Вы уже откликнулись на этот заказ
                  </p>
                </div>
              )}
              <CustomerContacts
                orderId={orderId}
                customer={order.customer || { full_name: "Заказчик" }}
                hasAccess={hasContactAccess}
                offerAccepted={offerAccepted}
              />
            </>
          )}
        </div>
      </div>

      {order && (
        <CreateOfferModal
          orderId={orderId}
          orderTitle={order.title}
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  );
}

