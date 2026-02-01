<script lang="ts">
  import { toast } from "svelte-sonner";
</script>

<button onclick={() => toast.success("Hello world")}>Toast</button>
