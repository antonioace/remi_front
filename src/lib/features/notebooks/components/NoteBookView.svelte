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
  import NoteBookDetails from "./NoteBookDetails.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Plus, Loader2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  import type {
    PaginationResult,
    HttpResult,
  } from "$lib/features/shared/types";

  let notebooks = $state<Notebook[]>([]);
  let meta = $state<PaginationResult<Notebook>["meta"] | undefined>(undefined);
  let page = $state(1);
  let limit = 20;
  let isLoading = $state(true);
  let isSheetOpen = $state(false);
  let isDetailsOpen = $state(false);
  let selectedNotebook = $state<Notebook | undefined>(undefined);
  let viewedNotebook = $state<Notebook | undefined>(undefined);

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

  function openView(notebook: Notebook) {
    viewedNotebook = notebook;
    isDetailsOpen = true;
  }

  onMount(loadNotebooks);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-semibold tracking-tight text-[#5c5b63]">Tus Notebooks</h2>
    <Button
      onclick={openCreate}
      class="flex items-center gap-2 bg-[#a151fc] hover:bg-[#8e44e3] text-white"
    >
      <Plus class="h-4 w-4" />
    </Button>
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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each notebooks as notebook (notebook.id)}
        <NoteBookCard
          {notebook}
          onEdit={openEdit}
          onDelete={handleDelete}
          onView={openView}
        />
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
      <div class="flex-1 overflow-y-hidden">
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

  <!-- Dialog for Details View -->
  <Dialog.Root bind:open={isDetailsOpen}>
    <Dialog.Content class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
      <Dialog.Header>
        <Dialog.Title class="text-2xl">{viewedNotebook?.name}</Dialog.Title>
        <Dialog.Description>
          Detalles completos del notebook.
        </Dialog.Description>
      </Dialog.Header>
      <div class="flex-1 overflow-y-auto pr-2">
        {#if viewedNotebook}
          <NoteBookDetails notebook={viewedNotebook} />
        {/if}
      </div>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => (isDetailsOpen = false)}
          >Cerrar</Button
        >
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
