/**
 * usePushNotifications.js
 *
 * React hook to register the Service Worker (/sw.js) and subscribe the browser
 * for background Web Push notifications using VAPID keys.
 */

import { useEffect } from "react";

const BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/+$/, "");

// Helper to convert base64 VAPID key to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(user) {
  useEffect(() => {
    if (!user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("[WebPush] Push notifications not supported by this browser.");
      return;
    }

    async function registerAndSubscribe() {
      try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        await navigator.serviceWorker.ready;

        // 2. Fetch VAPID public key from backend
        const token = sessionStorage.getItem("vp_token");
        if (!token) return;

        const keyRes = await fetch(`${BASE}/notifications/vapid-key`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!keyRes.ok) return;
        const { publicKey } = await keyRes.json();

        if (!publicKey) {
          console.log("[WebPush] VAPID public key not available.");
          return;
        }

        // 3. Request Notification Permission if default
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          if (perm !== "granted") {
            console.log("[WebPush] Push permission denied by user.");
            return;
          }
        }

        if (Notification.permission !== "granted") return;

        // 4. Check existing subscription or create new
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const convertedKey = urlBase64ToUint8Array(publicKey);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
        }

        // 5. Send subscription payload to backend
        await fetch(`${BASE}/notifications/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscription }),
        });

        console.log("[WebPush] Successfully subscribed for background push notifications.");
      } catch (err) {
        console.error("[WebPush] Failed to register push subscription:", err);
      }
    }

    registerAndSubscribe();
  }, [user]);
}
