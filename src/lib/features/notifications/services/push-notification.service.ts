import { HttpClient } from "$lib/features/shared/http-client";
import { env } from "$env/dynamic/public";

export interface CreateSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService extends HttpClient {
  constructor() {
    super("push-notifications");
  }

  private urlBase64ToUint8Array(base64String: string) {
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

  async subscribeToPush() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(env.PUBLIC_VAPID_KEY),
        });
      }

      // Convert to DTO format
      const subscriptionJson = subscription.toJSON();
      
      if (!subscriptionJson.keys || !subscriptionJson.endpoint) {
          throw new Error("Invalid subscription object");
      }

      const dto: CreateSubscriptionDto = {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth
        }
      };

      await this.instance.post("subscribe", dto);
      console.log("Push notification subscription successful");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
