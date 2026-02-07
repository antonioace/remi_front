<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { onMount } from "svelte";
  import { authState } from "$lib/stores/auth.svelte";
  import { pushNotificationService } from "$lib/features/notifications/services/push-notification.service";

  export const ssr = false;
  let { children } = $props();

  $effect(() => {
    if (authState.isAuthenticated) {
      pushNotificationService.subscribeToPush();
    }
  });

  async function detectedSwUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (confirm("New version available. Load new version?")) {
              newWorker?.postMessage({
                type: "skipWaiting",
              });
              window.location.reload();
            }
          }
        });
      });
    }
  }

  onMount(() => {
    authState.init();
    detectedSwUpdate();
  });
</script>

<Toaster />
{@render children()}
