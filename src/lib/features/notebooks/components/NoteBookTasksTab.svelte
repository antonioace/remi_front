<script lang="ts">
  import type { Notebook } from "../types";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { ListTodo, Plus, Paperclip, Loader2 } from "@lucide/svelte";
  import { notebookService } from "../services/notebook.service";
  import { toast } from "svelte-sonner";
  import NoteEditorModal from "./NoteEditorModal.svelte";
  import type { NoteTask } from "../types";

  interface Props {
    notebook: Notebook;
  }
  let { notebook = $bindable() }: Props = $props();
  let newTaskText = $state("");
  let isReadingFile = $state(false);
  let isEditorOpen = $state(false);
  let editorValue = $state("");
  let editingTaskId = $state<string | null>(null);
  let isSavingFromEditor = $state(false);

  function handleExpand(task: NoteTask) {
    editingTaskId = task.id;
    editorValue = task.contentText;
    isEditorOpen = true;
  }

  async function handleEditorSave(val: string) {
    if (!val.trim()) {
      isEditorOpen = false;
      return;
    }
    isSavingFromEditor = true;

    if (editingTaskId) {
      // Update existing
      await updateTask(editingTaskId, val.trim());
    } else {
      // This case is currently not used but kept for safety
      const newTask = {
        id: crypto.randomUUID(),
        contentText: val.trim(),
      };
      const currentTasks = notebook.content?.tasks || [];
      const newTasks = [...currentTasks, newTask];
      await handleUpdateField("content", {
        ...notebook.content,
        tasks: newTasks,
      });
      if (!notebook.content) notebook.content = {};
      notebook.content.tasks = newTasks;
    }

    isEditorOpen = false;
    isSavingFromEditor = false;
    editingTaskId = null;
    toast.success("Nota guardada");
  }

  async function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "txt" && extension !== "json") {
      toast.error("Solo se permiten archivos .txt o .json");
      return;
    }

    isReadingFile = true;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const newTask = {
          id: crypto.randomUUID(),
          contentText: content.trim(),
        };
        const currentTasks = notebook.content?.tasks || [];
        const newTasks = [...currentTasks, newTask];

        await handleUpdateField("content", {
          ...notebook.content,
          tasks: newTasks,
        });

        if (!notebook.content) notebook.content = {};
        notebook.content.tasks = newTasks;
        toast.success(`Archivo "${file.name}" importado`);
      }
      isReadingFile = false;
      target.value = "";
    };

    reader.onerror = () => {
      toast.error("Error al leer el archivo");
      isReadingFile = false;
    };

    reader.readAsText(file);
  }

  async function handleUpdateField(field: string, value: unknown) {
    const result = await notebookService.updateNotebook(notebook.id, {
      [field]: value,
    });
    if (result.success) {
      toast.success("Actualizado correctamente");
    } else {
      toast.error("Error al actualizar: " + result.error);
      throw new Error(result.error);
    }
  }

  async function addTask() {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      contentText: newTaskText.trim(),
    };
    const currentTasks = notebook.content?.tasks || [];
    const newTasks = [...currentTasks, newTask];
    await handleUpdateField("content", {
      ...notebook.content,
      tasks: newTasks,
    });
    if (!notebook.content) notebook.content = {};
    notebook.content.tasks = newTasks;
    newTaskText = "";
  }

  async function updateTask(taskId: string, val: string) {
    if (!notebook.content?.tasks) return;
    const newTasks = notebook.content.tasks.map((t) =>
      t.id === taskId ? { ...t, contentText: val } : t,
    );
    await handleUpdateField("content", {
      ...notebook.content,
      tasks: newTasks,
    });
    notebook.content.tasks = newTasks;
  }

  async function deleteTask(taskId: string) {
    if (!confirm("¿Eliminar nota?")) return;
    if (!notebook.content?.tasks) return;
    const newTasks = notebook.content.tasks.filter((t) => t.id !== taskId);
    await handleUpdateField("content", {
      ...notebook.content,
      tasks: newTasks,
    });
    notebook.content.tasks = newTasks;
  }
  import NoteBookTaskItem from "./NoteBookTaskItem.svelte";
</script>

<div class="mb-6 flex flex-col sm:flex-row gap-2">
  <div class="flex-1 flex gap-2">
    <Input
      bind:value={newTaskText}
      placeholder="Escribe una nueva nota o tarea..."
      onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
      class="bg-white h-10"
    />
    <div class="relative">
      <Button
        variant="outline"
        class="bg-white border-slate-200 text-slate-500 hover:text-[#a151fc] hover:border-[#a151fc] h-10 w-10 p-0 rounded-lg shrink-0"
        title="Subir archivo (.txt, .json)"
        disabled={isReadingFile}
      >
        {#if isReadingFile}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Paperclip class="h-4 w-4" />
        {/if}
      </Button>
      <input
        type="file"
        accept=".txt,.json"
        class="absolute inset-0 opacity-0 cursor-pointer"
        onchange={handleFileUpload}
        disabled={isReadingFile}
      />
    </div>
  </div>
  <Button
    onclick={addTask}
    variant="outline"
    class="bg-white border-[#a151fc] text-[#a151fc] hover:bg-[#a151fc]/5 flex items-center gap-2 w-full sm:w-auto shrink-0 justify-center h-10"
  >
    <Plus class="h-4 w-4" />
    <span class="sm:hidden">Añadir Nota</span>
  </Button>
</div>

<NoteEditorModal
  bind:open={isEditorOpen}
  bind:value={editorValue}
  onSave={handleEditorSave}
  onClose={() => (isEditorOpen = false)}
  isSaving={isSavingFromEditor}
/>

{#if !notebook.content?.tasks || notebook.content.tasks.length === 0}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="rounded-full bg-slate-50 p-4 mb-4">
      <ListTodo class="h-8 w-8 text-slate-300" />
    </div>
    <p class="text-sm font-medium text-slate-400">Sin notas adicionales</p>
  </div>
{:else}
  <div class="space-y-4">
    {#each notebook.content.tasks as task (task.id)}
      <NoteBookTaskItem
        {task}
        onUpdate={(val) => updateTask(task.id, val)}
        onDelete={() => deleteTask(task.id)}
        onExpand={() => handleExpand(task)}
      />
    {/each}
  </div>
{/if}
