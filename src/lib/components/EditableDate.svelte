<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Check, X, Loader2 } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import dayjs from "dayjs";

  let {
    value = $bindable(undefined),
    isEditing = $bindable(false),
    onSave,
    children,
    textClass = "",
  } = $props<{
    value: string | Date | undefined | null;
    isEditing?: boolean;
    onSave: (val: string) => Promise<void>;
    children: Snippet;
    textClass?: string;
  }>();

  let tempValue = $state("");
  let isLoading = $state(false);

  function startEdit() {
    tempValue = value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";
    isEditing = true;
  }

  function cancelEdit() {
    isEditing = false;
  }

  async function saveEdit() {
    const isoString = tempValue ? dayjs(tempValue).toISOString() : "";
    const currentIso = value ? dayjs(value).toISOString() : "";
    
    if (isoString === currentIso) {
      isEditing = false;
      return;
    }

    isLoading = true;
    try {
      await onSave(isoString);
      value = isoString;
      isEditing = false;
    } catch (e) {
      console.error("Error al guardar la fecha: ", e);
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") cancelEdit();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  }
</script>

{#if isEditing}
  <div
    class="relative flex items-center gap-2 w-fit min-w-[200px] max-w-full animate-in fade-in zoom-in-95 duration-200"
  >
    <Input
      type="datetime-local"
      bind:value={tempValue}
      onkeydown={handleKeydown}
      class="h-9 bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#a151fc]/20 focus-visible:border-[#a151fc] transition-all w-full"
      autofocus
    />
    <div class="flex gap-1 shrink-0">
      <Button
        size="icon"
        variant="ghost"
        class="h-8 w-8 text-[#a151fc] border border-[#a151fc]/20 hover:border-[#a151fc]/50 hover:bg-[#a151fc]/5 rounded-full shadow-sm transition-all"
        onclick={saveEdit}
        disabled={isLoading}
      >
        {#if isLoading}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Check class="h-4 w-4" />
        {/if}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        class="h-8 w-8 text-[#a151fc]/70 border border-[#a151fc]/20 hover:text-[#a151fc] hover:border-[#a151fc]/50 hover:bg-[#a151fc]/5 rounded-full shadow-sm transition-all"
        onclick={cancelEdit}
        disabled={isLoading}
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
{:else}
  <button
    class="group relative flex items-center w-fit max-w-full text-left rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/30 p-2 -m-2 transition-all cursor-pointer"
    onclick={startEdit}
    aria-label="Editar fecha"
  >
    <div class="flex-1 {textClass}">
      {@render children()}
    </div>
  </button>
{/if}
