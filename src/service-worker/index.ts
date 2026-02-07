/// <reference types="@sveltejs/kit" />

import { build, files, version } from "$service-worker";

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
];

interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

self.addEventListener("install", (event: ExtendableEvent) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  // Remove previous caches
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event: FetchEvent) => {
  // ignore POST requests etc
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);

      if (response) return response;
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }

  event.respondWith(respond());
});

self.addEventListener("message", (event: ExtendableEvent) => {
  if ((event as any).data && (event as any).data.type === "skipWaiting") {
    (self as any).skipWaiting();
  }
});

// --- PUSH NOTIFICATIONS ---

interface PushEvent extends ExtendableEvent {
  data: {
    json(): any;
    text(): string;
  } | null;
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

self.addEventListener("push", (event: any) => {
  const pushEvent = event as PushEvent;
  
  // Default values
  let data = { 
    title: "Nueva notificación", 
    body: "Tienes un nuevo mensaje", 
    url: "/", 
    icon: "/pwa-192x192.png" 
  };

  try {
    if (pushEvent.data) {
      const payload = pushEvent.data.json();
      // Merge default with payload
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.error("Error parsing push data", e);
  }

  const options = {
    body: data.body,
    icon: data.icon, 
    badge: "/pwa-64x64.png", // Using small icon as badge
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };

  pushEvent.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event: any) => {
  const notificationEvent = event as NotificationEvent;
  
  notificationEvent.notification.close();

  notificationEvent.waitUntil(
    (clients as any).matchAll({ type: "window", includeUncontrolled: true }).then((clientList: any[]) => {
      const url = notificationEvent.notification.data.url || "/";
      
      // If a window is already open with that URL, focus it
      for (const client of clientList) {
        // Simple check if url matches or contains
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if ((clients as any).openWindow) {
        return (clients as any).openWindow(url);
      }
    })
  );
});
