<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type {
    NoteTask,
    Notebook,
    CreateNotebookDto,
    UpdateNotebookDto,
  } from "../types";
  import { authState } from "$lib/stores/auth.svelte";
  import { Plus, Trash2 } from "@lucide/svelte";
  import dayjs from "dayjs";

  let { notebook, onSubmit, onCancel } = $props<{
    notebook?: Notebook;
    onSubmit: (data: CreateNotebookDto | UpdateNotebookDto) => void;
    onCancel: () => void;
  }>();

  let formData = $state({
    name: "",
    description: "",
    textContent: "",
    assignedAt: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tasks: [] as NoteTask[],
  });

  $effect(() => {
    if (notebook) {
      formData.name = notebook.name;
      formData.description = notebook.description || "";
      formData.textContent = notebook.textContent;
      formData.assignedAt = notebook.assignedAt
        ? dayjs(notebook.assignedAt).format("YYYY-MM-DDTHH:mm")
        : "";
      formData.timezone =
        notebook.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.tasks = notebook.content?.tasks
        ? JSON.parse(JSON.stringify(notebook.content.tasks))
        : [];
    } else {
      formData.name = "";
      formData.description = "";
      formData.textContent = "";
      formData.assignedAt = "";
      formData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.tasks = [];
    }
  });

  function addTask() {
    formData.tasks = [
      ...formData.tasks,
      { id: crypto.randomUUID(), name: "", contentText: "" },
    ];
  }

  function removeTask(index: number) {
    formData.tasks = formData.tasks.filter((_, i) => i !== index);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const { tasks, ...rest } = formData;
    const payload = {
      ...rest,
      assignedAt: rest.assignedAt
        ? dayjs(rest.assignedAt).toISOString()
        : undefined,
      userId: authState.user?.userId,
      content: { tasks },
    };
    onSubmit(payload);
  }
</script>

<form
  onsubmit={handleSubmit}
  class="space-y-6 py-6 max-h-[85vh] overflow-y-auto px-6"
>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Nombre del Notebook</Label>
      <Input
        id="name"
        bind:value={formData.name}
        placeholder="Ej: Proyecto Final"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="description">Descripción</Label>
      <Input
        id="description"
        bind:value={formData.description}
        placeholder="Breve descripción opcional"
      />
    </div>

    <div class="space-y-2">
      <Label for="textContent">Contenido Principal</Label>
      <textarea
        id="textContent"
        bind:value={formData.textContent}
        placeholder="Escribe aquí el contenido principal..."
        rows={4}
        required
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      ></textarea>
    </div>

    <div class="space-y-2">
      <Label for="assignedAt">Fecha de asignación (Opcional)</Label>
      <Input id="assignedAt" type="datetime-local" bind:value={formData.assignedAt} />
    </div>
  </div>

  <div class="border-t pt-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3
        class="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Notas Adicionales (Tasks)
      </h3>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onclick={addTask}
        class="h-8 gap-1"
      >
        <Plus class="h-3.5 w-3.5" />
        Agregar Nota
      </Button>
    </div>

    {#if formData.tasks.length === 0}
      <p
        class="text-xs text-center text-muted-foreground py-4 border border-dashed rounded-md"
      >
        No hay notas adicionales.
      </p>
    {:else}
      <div class="space-y-4">
        {#each formData.tasks as task, i (i)}
          <div class="relative p-4 rounded-lg border bg-slate-50 space-y-3">
            <button
              type="button"
              onclick={() => removeTask(i)}
              class="absolute top-2 right-2 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 class="h-4 w-4" />
            </button>
            <div class="space-y-2">
              <Label class="text-xs">Título de la nota</Label>
              <Input
                bind:value={task.name}
                placeholder="Título"
                class="h-8 text-xs bg-white"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs">Contenido</Label>
              <textarea
                bind:value={task.contentText}
                placeholder="Contenido de la nota..."
                rows={2}
                class="flex min-h-[60px] w-full rounded-md border border-input bg-white px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              ></textarea>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="flex justify-end gap-2 pt-6 sticky bottom-0 bg-white border-t py-2"
  >
    <Button variant="ghost" type="button" onclick={onCancel}>Cancelar</Button>
    <Button type="submit"
      >{notebook ? "Actualizar Notebook" : "Crear Notebook"}</Button
    >
  </div>
</form>
