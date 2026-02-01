<script lang="ts">
  import PrivateRoutesGuard from "$lib/features/auth/components/PrivateRoutesGuard.svelte";
  let { children } = $props();
</script>

<PrivateRoutesGuard>
  {@render children()}
</PrivateRoutesGuard>
