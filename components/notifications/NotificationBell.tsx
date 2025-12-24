"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const locale = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn("Supabase not configured:", error);
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.warn("Supabase not configured:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      loadNotifications();
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      loadNotifications();
    } catch (error) {
      console.warn("Failed to mark all as read:", error);
    }
  };

  if (notifications.length === 0 && unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-primary transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || `/${locale}/orders`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    setShowDropdown(false);
                  }}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  {!notification.is_read && (
                    <span className="inline-block mt-2 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Нет уведомлений
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




