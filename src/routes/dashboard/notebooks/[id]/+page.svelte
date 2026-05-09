<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { notebookService } from "$lib/features/notebooks/services/notebook.service";
  import type { Notebook } from "$lib/features/notebooks/types";
  import NoteBookDetails from "$lib/features/notebooks/components/NoteBookDetails.svelte";
  import { Loader2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import Header from "$lib/components/Header.svelte";
  import EditableText from "$lib/components/EditableText.svelte";

  let notebookId = $derived($page.params.id);
  let notebook = $state<Notebook | undefined>(undefined);
  let isLoading = $state(true);

  onMount(async () => {
    isLoading = true;
    if (!notebookId) {
      toast.error("No se especifico un id");
      await goto("/dashboard/home");
      return;
    }

    notebookService.getById(notebookId).then(async (result) => {
      console.log("REUSLT", result);
      if (result.success && result.data) {
        notebook = result.data;
      } else {
        toast.error("Error al cargar el notebook");
        await goto("/dashboard/home");
      }
      isLoading = false;
    });
  });

  async function handleUpdateName(val: string) {
    if (!notebook) return;
    const result = await notebookService.updateNotebook(notebook.id, {
      name: val,
    });
    if (result.success) {
      toast.success("Nombre actualizado correctamente");
    } else {
      toast.error("Error al actualizar: " + result.error);
      throw new Error(result.error);
    }
  }
</script>

<div class="flex-1 flex flex-col overflow-hidden h-full">
  <Header title="Remido" backUrl="/dashboard/home" />

  <main class="grow p-6 lg:p-10 space-y-6 w-full overflow-y-auto flex flex-col">
    <div class="pt-4 flex flex-col grow">
      {#if isLoading}
        <div class="flex h-64 items-center justify-center">
          <Loader2 class="h-8 w-8 animate-spin text-[#a151fc]" />
        </div>
      {:else if notebook}
        <div class="space-y-4">
          <EditableText
            bind:value={notebook.name}
            onSave={handleUpdateName}
            textClass="text-3xl font-bold text-slate-900"
          >
            <h2 class="text-3xl font-bold text-slate-900">
              {notebook.name}
            </h2>
          </EditableText>

          <NoteBookDetails bind:notebook />
        </div>
      {/if}
    </div>
  </main>
</div>
