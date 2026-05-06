<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Check, X, Loader2 } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  let {
    value = $bindable(""),
    isEditing = $bindable(false),
    isTextarea = false,
    placeholder = "Escribe algo...",
    onSave,
    children,
    textClass = "",
  } = $props<{
    value: string | undefined;
    isEditing?: boolean;
    isTextarea?: boolean;
    placeholder?: string;
    onSave: (val: string) => Promise<void>;
    children: Snippet;
    textClass?: string;
  }>();

  let tempValue = $state("");
  let isLoading = $state(false);

  function startEdit() {
    tempValue = value || "";
    isEditing = true;
  }

  function cancelEdit() {
    isEditing = false;
  }

  async function saveEdit() {
    if (tempValue === value) {
      isEditing = false;
      return;
    }
    isLoading = true;
    try {
      await onSave(tempValue);
      value = tempValue;
      isEditing = false;
    } catch (e) {
      console.error("Error al guardar: ", e);
      // Error handled by parent
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") cancelEdit();
    if (e.key === "Enter" && !isTextarea && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  }
</script>

{#if isEditing}
  <div
    class="relative flex items-start gap-2 w-fit min-w-[200px] max-w-full animate-in fade-in zoom-in-95 duration-200"
  >
    {#if isTextarea}
      <textarea
        bind:value={tempValue}
        onkeydown={handleKeydown}
        {placeholder}
        class="flex min-h-[120px] w-full min-w-[300px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a151fc]/20 focus-visible:border-[#a151fc] transition-all"
        autofocus
      ></textarea>
    {:else}
      <Input
        bind:value={tempValue}
        onkeydown={handleKeydown}
        {placeholder}
        class="h-11 w-full bg-white focus-visible:ring-2 focus-visible:ring-[#a151fc]/20 focus-visible:border-[#a151fc] transition-all"
        autofocus
      />
    {/if}
    <div class="flex gap-1 shrink-0 mt-1">
      <Button
        size="icon"
        variant="ghost"
        class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
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
        class="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
        onclick={cancelEdit}
        disabled={isLoading}
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
{:else}
  <button
    class="group relative flex items-start w-fit max-w-full text-left rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/30 p-2 -m-2 transition-all cursor-pointer"
    onclick={startEdit}
    aria-label="Editar campo"
  >
    <div class="flex-1 {textClass}">
      {@render children()}
    </div>
  </button>
{/if}
