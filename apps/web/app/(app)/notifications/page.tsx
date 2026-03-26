"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const load = async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, { credentials: "include" });
    const json = await response.json();
    setNotifications(json.data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const markRead = async (id: string) => {
    await fetch(`${API_BASE_URL}/notifications/read`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });

    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      {notifications.map((notification) => (
        <article key={notification.id} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium">{notification.title}</h2>
          <p className="mt-1 text-sm text-zinc-700">{notification.body}</p>
          <button onClick={() => markRead(notification.id)} className="mt-3 rounded-md border border-border px-3 py-2 text-sm">
            {notification.isRead ? "Read" : "Mark as read"}
          </button>
        </article>
      ))}
    </div>
  );
}
