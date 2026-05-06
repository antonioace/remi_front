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
  import dayjs from "dayjs";
  import { Trash2 } from "@lucide/svelte";

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
    tags: [] as string[],
  });

  let newTag = $state("");

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
      formData.tags = notebook.content?.tags
        ? JSON.parse(JSON.stringify(notebook.content.tags))
        : [];
    } else {
      formData.name = "";
      formData.description = "";
      formData.textContent = "";
      formData.assignedAt = "";
      formData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.tasks = [];
      formData.tags = [];
      newTag = "";
    }
  });

  function addTag(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = newTag.trim();
      if (tag && !formData.tags.includes(tag)) {
        formData.tags = [...formData.tags, tag];
      }
      newTag = "";
    }
  }

  function removeTag(index: number) {
    formData.tags = formData.tags.filter((_, i) => i !== index);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const { tasks, tags, ...rest } = formData;
    const payload = {
      ...rest,
      assignedAt: rest.assignedAt
        ? dayjs(rest.assignedAt).toISOString()
        : undefined,
      userId: authState.user?.userId,
      content: { tasks, tags },
    };
    onSubmit(payload);
  }
</script>

<form
  onsubmit={handleSubmit}
  class="space-y-6 py-6 max-h-[85vh] overflow-y-auto"
>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name"
        >Nombre del Notebook <span class="text-red-500">*</span></Label
      >
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
      <Label for="textContent"
        >Contenido Principal <span class="text-red-500">*</span></Label
      >
      <textarea
        id="textContent"
        bind:value={formData.textContent}
        placeholder="Escribe aquí el contenido principal..."
        rows={4}
        required
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      ></textarea>
    </div>

    <!-- Tags Selector -->
    <div class="space-y-3 pt-2">
      <Label>Etiquetas</Label>
      <div class="flex flex-wrap gap-2 mb-2">
        {#each formData.tags as tag, i (tag)}
          <span
            class="inline-flex items-center gap-1 bg-[#a151fc]/10 text-[#a151fc] px-2.5 py-1 rounded-lg text-xs font-semibold"
          >
            {tag}
            <button
              type="button"
              onclick={() => removeTag(i)}
              class="hover:text-red-500 transition-colors ml-1 focus:outline-none"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </span>
        {/each}
      </div>
      <Input
        type="text"
        placeholder="Escribe un tag y presiona Enter..."
        bind:value={newTag}
        onkeydown={addTag}
        class="h-10 rounded-xl"
      />
    </div>

    <div class="space-y-2">
      <Label for="assignedAt">Fecha de asignación</Label>
      <Input
        id="assignedAt"
        type="datetime-local"
        bind:value={formData.assignedAt}
      />
    </div>
  </div>

  <div
    class="border h-15 border-t flex items-center absolute bottom-0 left-0 flex w-full items-center"
  >
    <Button
      variant="ghost"
      onclick={onCancel}
      class="text-[#000] px-6 h-full flex-[0.5] border border-r-4 border-slate-50 rounded-none"
      >Cancelar</Button
    >
    <Button
      type="submit"
      class="text-[#a151fc] px-6 h-full flex-[0.5] rounded-none"
      >{notebook ? "Actualizar Notebook" : "Crear Notebook"}</Button
    >
  </div>
</form>
