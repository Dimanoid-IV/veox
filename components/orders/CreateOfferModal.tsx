"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface CreateOfferModalProps {
  orderId: string;
  orderTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOfferModal({
  orderId,
  orderTitle,
  isOpen,
  onClose,
  onSuccess,
}: CreateOfferModalProps) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/offers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          price: price ? parseFloat(price) : null,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при создании отклика");
      }

      // Success
      setPrice("");
      setMessage("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Откликнуться на заказ
        </h2>
        <p className="text-gray-600 mb-6">{orderTitle}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваша цена (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="Например: 50.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Оставьте пустым, если цена договорная
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сообщение заказчику *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea"
              placeholder="Расскажите заказчику о вашем опыте и условиях работы..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Отправка..." : "Откликнуться"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




