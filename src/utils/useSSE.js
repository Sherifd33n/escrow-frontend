/**
 * useSSE.js
 *
 * React hook that establishes a single SSE connection per logged-in user
 * and exposes a simple pub/sub system so any component can subscribe to
 * real-time server events without extra network connections.
 *
 * Usage:
 *   // In App.jsx (once)
 *   const { emit } = useSSE(user, onSSEEvent);
 *
 *   // In any dashboard component
 *   useEffect(() => {
 *     const unsub = sseEmitter.on("transaction_update", fetchDashboardData);
 *     return unsub;
 *   }, []);
 */

import { useEffect, useRef } from "react";
import { connectNotificationStream } from "./api";

// ── Simple event emitter that survives re-renders ─────────────────────────────
const listeners = new Map();

export const sseEmitter = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event)?.delete(fn);
  },
  emit(event, payload) {
    listeners.get(event)?.forEach(fn => {
      try { fn(payload); } catch (e) { console.error("[sseEmitter] handler error:", e); }
    });
    // Also emit a catch-all "any" event for generic refreshers
    listeners.get("any")?.forEach(fn => {
      try { fn({ event, payload }); } catch (e) {}
    });
  },
};

// Map backend notification type prefixes → emitter event names
const TYPE_TO_EVENT = {
  transaction: "transaction_update",
  kyc:         "kyc_update",
  dispute:     "dispute_update",
  wallet:      "wallet_update",
  payment:     "wallet_update",
  milestone:   "transaction_update",
  review:      "review_update",
  system:      "system_update",
};

function resolveEvent(type = "") {
  const lower = type.toLowerCase();
  for (const [prefix, event] of Object.entries(TYPE_TO_EVENT)) {
    if (lower.startsWith(prefix)) return event;
  }
  return "notification";
}

/**
 * Connects SSE for the current user and re-emits events through sseEmitter.
 * Should be called once at the App level.
 *
 * @param {object|null} user  - Logged-in user object (null when logged out).
 */
export function useSSE(user) {
  const esRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    if (!user) {
      // Clean up when logged out
      esRef.current?.close();
      esRef.current = null;
      clearTimeout(reconnectTimer.current);
      return;
    }

    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      const es = connectNotificationStream((notification) => {
        const event = resolveEvent(notification.type);
        sseEmitter.emit(event, notification);
        sseEmitter.emit("notification", notification);
      });

      if (!es) return; // no token yet

      es.onerror = () => {
        es.close();
        if (!destroyed) {
          // Reconnect after 5 s
          reconnectTimer.current = setTimeout(connect, 5000);
        }
      };

      esRef.current = es;
    };

    connect();

    return () => {
      destroyed = true;
      clearTimeout(reconnectTimer.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [user?.id]);
}
