<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authState } from "$lib/stores/auth.svelte";

  onMount(() => {
    if (authState.isAuthenticated) {
      goto("/dashboard/home");
    } else {
      goto("/auth/login");
    }
  });
</script>

<div class="flex h-screen items-center justify-center">
  <div
    class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
  ></div>
</div>
