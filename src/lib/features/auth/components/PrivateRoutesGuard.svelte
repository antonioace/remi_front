<script lang="ts">
  import { authState } from "$lib/stores/auth.svelte";
  import { authService } from "../services/auth.service";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let { children } = $props();
  let isChecking = $state(true);

  onMount(async () => {
    authState.init();

    if (authState.isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const result = await authService.verifyToken(token);
          if (!result.success || !result.data?.valid) {
            authState.logout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          authState.logout();
        }
      } else {
        authState.logout();
      }
    }
    isChecking = false;
  });

  $effect(() => {
    if (!isChecking && !authState.isAuthenticated) {
      goto("/auth/login");
    }
  });
</script>

{#if isChecking}
  <div class="flex h-screen items-center justify-center">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if authState.isAuthenticated}
  {@render children()}
{/if}
