<script lang="ts">
  import type { Notebook } from "../types";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { ListTodo, Plus } from "@lucide/svelte";
  import { notebookService } from "../services/notebook.service";
  import { toast } from "svelte-sonner";

  interface Props {
    notebook: Notebook;
  }
  let { notebook = $bindable() }: Props = $props();
  let newTaskText = $state("");

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

<div class="mb-6 flex gap-2">
  <Input
    bind:value={newTaskText}
    placeholder="Escribe una nueva nota o tarea..."
    onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
    class="bg-white"
  />
  <Button
    onclick={addTask}
    class="bg-[#a151fc] rounded-full hover:bg-[#8e44e3] text-white shrink-0"
  >
    <Plus class="h-4 w-4" />
  </Button>
</div>

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
      />
    {/each}
  </div>
{/if}
