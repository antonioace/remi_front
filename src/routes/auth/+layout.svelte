<script lang="ts">
  import PublicRoutesGuard from "$lib/features/auth/components/PublicRoutesGuard.svelte";
  let { children } = $props();
</script>

<PublicRoutesGuard>
  {@render children()}
</PublicRoutesGuard>
