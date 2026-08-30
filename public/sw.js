/**
 * Service Worker — Escrow Platform Web Push Handler
 * Listens for push events when browser/tab is closed and renders system desktop/mobile push notifications.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {
    title: "Escrow Platform Notification",
    body: "You have a new update.",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: "/dashboard" },
  };

  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }

  const options = {
    body: payload.body || payload.message || "New notification received",
    icon: payload.icon || "/favicon.svg",
    badge: payload.badge || "/favicon.svg",
    vibrate: [100, 50, 100],
    data: payload.data || { url: "/dashboard" },
    actions: [
      { action: "open", title: "View Dashboard" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Escrow Platform", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
