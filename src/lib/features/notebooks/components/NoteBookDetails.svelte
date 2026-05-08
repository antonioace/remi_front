<script lang="ts">
  import type { Notebook } from "../types";
  import { Calendar, FileText, Info } from "@lucide/svelte";
  import dayjs from "dayjs";
  import EditableText from "$lib/components/EditableText.svelte";
  import EditableDate from "$lib/components/EditableDate.svelte";
  import { notebookService } from "../services/notebook.service";
  import { toast } from "svelte-sonner";

  import NoteBookTasksTab from "./NoteBookTasksTab.svelte";
  import NoteBookAudiosTab from "./NoteBookAudiosTab.svelte";
  import NoteBookImagesTab from "./NoteBookImagesTab.svelte";
  import NoteBookScheduleTab from "./NoteBookScheduleTab.svelte";
  import { Mic, Image as ImageIcon, Bell } from "@lucide/svelte";

  interface Props {
    notebook: Notebook;
  }
  let { notebook = $bindable() }: Props = $props();

  let activeTab = $state<"tasks" | "audios" | "images" | "alarms">("tasks");

  async function handleUpdateField(field: string, value: unknown) {
    let finalValue = value;
    if (field === "assignedAt" && value) {
      finalValue = dayjs(value as string | Date).toISOString();
    }

    const result = await notebookService.updateNotebook(notebook.id, {
      [field]: finalValue,
    });
    if (result.success) {
      toast.success("Actualizado correctamente");
    } else {
      toast.error("Error al actualizar: " + result.error);
      throw new Error(result.error);
    }
  }
</script>

<div class="space-y-6 py-4 text-left">
  <!-- Description -->
  <div class="space-y-2">
    <div class="flex items-center gap-2 text-muted-foreground">
      <Info class="h-4 w-4" />
      <span class="text-sm font-medium uppercase tracking-wider"
        >Descripción</span
      >
    </div>
    <EditableText
      bind:value={notebook.description}
      isTextarea={true}
      onSave={(val) => handleUpdateField("description", val)}
    >
      <p class="text-sm leading-relaxed text-slate-700 italic py-1">
        {notebook.description || "Sin descripción proporcionada."}
      </p>
    </EditableText>
  </div>

  <!-- Content -->
  <div class="space-y-2">
    <div class="flex items-center gap-2 text-muted-foreground">
      <FileText class="h-4 w-4" />
      <span class="text-sm font-medium uppercase tracking-wider"
        >Contenido Principal</span
      >
    </div>
    <EditableText
      bind:value={notebook.textContent}
      isTextarea={true}
      onSave={(val) => handleUpdateField("textContent", val)}
    >
      <div
        class="text-sm leading-relaxed whitespace-pre-wrap text-slate-800 min-h-[100px] py-2"
      >
        {notebook.textContent}
      </div>
    </EditableText>
  </div>

  <!-- Assigned At -->
  <div class="space-y-2">
    <div class="flex items-center gap-2 text-muted-foreground">
      <Calendar class="h-4 w-4" />
      <span class="text-sm font-medium uppercase tracking-wider"
        >Fecha de Asignación</span
      >
    </div>
    <EditableDate
      bind:value={notebook.assignedAt}
      onSave={(val) => handleUpdateField("assignedAt", val)}
    >
      <div class="text-sm text-slate-800 py-1">
        {#if notebook.assignedAt}
          {dayjs(notebook.assignedAt).format("DD/MM/YYYY HH:mm")}
        {:else}
          <span class="text-slate-400 italic">Sin fecha asignada</span>
        {/if}
      </div>
    </EditableDate>
  </div>

  <!-- Tabs Navigation -->
  <div class="pt-6">
    <div class="flex border-b gap-8">
      <button
        class="pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 {activeTab ===
        'tasks'
          ? 'border-[#a151fc] text-[#a151fc]'
          : 'border-transparent text-slate-500 hover:text-slate-700'}"
        onclick={() => (activeTab = "tasks")}
      >
        <FileText class="h-4 w-4" />
        Notas
      </button>
      <button
        class="pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 {activeTab ===
        'audios'
          ? 'border-[#a151fc] text-[#a151fc]'
          : 'border-transparent text-slate-500 hover:text-slate-700'}"
        onclick={() => (activeTab = "audios")}
      >
        <Mic class="h-4 w-4" />
        Audios
      </button>
      <button
        class="pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 {activeTab ===
        'images'
          ? 'border-[#a151fc] text-[#a151fc]'
          : 'border-transparent text-slate-500 hover:text-slate-700'}"
        onclick={() => (activeTab = "images")}
      >
        <ImageIcon class="h-4 w-4" />
        Imágenes
      </button>
      <button
        class="pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 {activeTab ===
        'alarms'
          ? 'border-[#a151fc] text-[#a151fc]'
          : 'border-transparent text-slate-500 hover:text-slate-700'}"
        onclick={() => (activeTab = "alarms")}
      >
        <Bell class="h-4 w-4" />
        Alarmas
      </button>
    </div>

    <!-- Tabs Content -->
    <div class="pt-6 min-h-[200px]">
      {#if activeTab === "tasks"}
        <NoteBookTasksTab bind:notebook />
      {:else if activeTab === "audios"}
        <NoteBookAudiosTab notebookId={notebook.id} />
      {:else if activeTab === "images"}
        <NoteBookImagesTab bind:notebook />
      {:else if activeTab === "alarms"}
        <NoteBookScheduleTab notebookId={notebook.id} />
      {/if}
    </div>
  </div>

  <div
    class="flex items-center gap-6 pt-10 text-[11px] text-slate-400 uppercase tracking-widest font-semibold"
  >
    <div class="flex items-center gap-1.5">
      <Calendar class="h-3.5 w-3.5" />
      <span>Creado: {dayjs(notebook.createdAt).format("DD/MM/YYYY HH:mm")}</span
      >
    </div>
  </div>
</div>
