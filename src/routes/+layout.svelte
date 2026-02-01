<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { onMount } from "svelte";
  export const ssr = false;
  let { children } = $props();

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
    detectedSwUpdate();
  });
</script>

<Toaster />
{@render children()}
