<script lang="ts">
  import { authState } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let { children } = $props();
  let isChecking = $state(true);

  onMount(async () => {
    authState.init();
    isChecking = false;
  });

  $effect(() => {
    // If authenticated, redirect away from public auth pages to dashboard
    // We only check this after mount (isChecking = false) ensures init has run
    if (!isChecking && authState.isAuthenticated) {
      goto("/dashboard/home");
    }
  });
</script>

{#if isChecking}
  <div class="flex h-screen items-center justify-center">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if !authState.isAuthenticated}
  {@render children()}
{/if}
