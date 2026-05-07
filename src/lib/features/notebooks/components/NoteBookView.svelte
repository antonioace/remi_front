<script lang="ts">
  import { onMount } from "svelte";
  import { notebookService } from "../services/notebook.service";
  import type {
    CreateNotebookDto,
    Notebook,
    UpdateNotebookDto,
  } from "../types";
  import NoteBookCard from "./NoteBookCard.svelte";
  import NoteBookForm from "./NoteBookForm.svelte";
  import CreateNotebookFromAudio from "./CreateNotebookFromAudio.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Plus, Loader2, Mic } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  import type { PaginationResult } from "$lib/features/shared/types";

  let notebooks = $state<Notebook[]>([]);
  let meta = $state<PaginationResult<Notebook>["meta"] | undefined>(undefined);
  let page = $state(1);
  let limit = 20;
  let isLoading = $state(true);
  let isSheetOpen = $state(false);
  let selectedNotebook = $state<Notebook | undefined>(undefined);
  let isAudioCreateOpen = $state(false);

  async function loadNotebooks() {
    isLoading = true;
    const result = await notebookService.getAll({ page, limit });
    if (result.success && result.data) {
      notebooks = result.data.data;
      meta = result.data.meta;
    } else {
      toast.error("Error al cargar notebooks: " + result.error);
    }
    isLoading = false;
  }

  function changePage(newPage: number) {
    if (meta && newPage >= 1 && newPage <= meta.lastPage) {
      page = newPage;
      loadNotebooks();
    }
  }

  async function handleCreateOrUpdate(
    data: CreateNotebookDto | UpdateNotebookDto,
  ) {
    let result;
    if (selectedNotebook) {
      result = await notebookService.updateNotebook(
        selectedNotebook.id,
        data as UpdateNotebookDto,
      );
    } else {
      result = await notebookService.createNotebook(data as CreateNotebookDto);
    }

    if (result.success) {
      toast.success(
        selectedNotebook ? "Notebook actualizado" : "Notebook creado",
      );
      isSheetOpen = false;
      selectedNotebook = undefined;
      loadNotebooks();
    } else {
      toast.error("Error: " + result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este notebook?"))
      return;

    const result = await notebookService.deleteNotebook(id);
    if (result.success) {
      toast.success("Notebook eliminado");
      loadNotebooks();
    } else {
      toast.error("Error al eliminar: " + result.error);
    }
  }

  function openEdit(notebook: Notebook) {
    selectedNotebook = notebook;
    isSheetOpen = true;
  }

  function openCreate() {
    selectedNotebook = undefined;
    isSheetOpen = true;
  }

  onMount(loadNotebooks);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold tracking-tight text-[#121212]">Notebooks</h2>
    <div class="flex items-center gap-2">
      <Button
        onclick={() => (isAudioCreateOpen = true)}
        variant="outline"
        size="icon"
        class="border-[#a151fc] text-[#a151fc] hover:bg-[#a151fc]/10"
      >
        <Mic class="h-4 w-4" />
      </Button>
      <Button
        onclick={openCreate}
        class="flex items-center gap-2 bg-[#a151fc] hover:bg-[#8e44e3] text-white"
      >
        <Plus class="h-4 w-4" />
      </Button>
    </div>
  </div>

  {#if isLoading}
    <div class="flex h-32 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  {:else if notebooks.length === 0}
    <div
      class="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center"
    >
      <p class="text-muted-foreground">No tienes notebooks aún.</p>
      <Button variant="link" onclick={openCreate}>Crea tu primero</Button>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-3">
      {#each notebooks as notebook (notebook.id)}
        <NoteBookCard {notebook} onEdit={openEdit} onDelete={handleDelete} />
      {/each}
    </div>

    {#if meta && meta.lastPage > 1}
      <div class="flex items-center justify-center gap-2 pt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onclick={() => changePage(page - 1)}
        >
          Anterior
        </Button>
        <div class="text-sm font-medium">
          Página {page} de {meta.lastPage}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.lastPage}
          onclick={() => changePage(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    {/if}
  {/if}

  <!-- Sheet for Create/Edit -->
  <Sheet.Root bind:open={isSheetOpen}>
    <Sheet.Content
      side="right"
      class="w-full  sm:max-w-[600px] p-0 flex flex-col"
    >
      <Sheet.Header class="px-6 pt-6 pb-2 border-b">
        <Sheet.Title
          >{selectedNotebook
            ? "Editar Notebook"
            : "Nuevo Notebook"}</Sheet.Title
        >
        <Sheet.Description>
          Completa los campos para {selectedNotebook ? "actualizar" : "crear"} tu
          notebook.
        </Sheet.Description>
      </Sheet.Header>
      <div class="flex-1 overflow-y-hidden p-4">
        <NoteBookForm
          notebook={selectedNotebook}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            isSheetOpen = false;
            selectedNotebook = undefined;
          }}
        />
      </div>
    </Sheet.Content>
  </Sheet.Root>

  <CreateNotebookFromAudio
    bind:open={isAudioCreateOpen}
    onSuccess={() => {
      loadNotebooks();
    }}
  />
</div>
