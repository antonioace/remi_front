<script lang="ts">
  import type { Notebook } from "../types";
  import { Calendar, ListTodo, FileText, Info } from "@lucide/svelte";
  import dayjs from "dayjs";

  let { notebook } = $props<{
    notebook: Notebook;
  }>();
</script>

<div class="space-y-6 py-4">
  <div class="space-y-2">
    <div class="flex items-center gap-2 text-muted-foreground">
      <Info class="h-4 w-4" />
      <span class="text-sm font-medium uppercase tracking-wider"
        >Descripción</span
      >
    </div>
    <p
      class="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-md border italic"
    >
      {notebook.description || "Sin descripción proporcionada."}
    </p>
  </div>

  <div class="space-y-2">
    <div class="flex items-center gap-2 text-muted-foreground">
      <FileText class="h-4 w-4" />
      <span class="text-sm font-medium uppercase tracking-wider"
        >Contenido Principal</span
      >
    </div>
    <div
      class="text-sm leading-relaxed whitespace-pre-wrap text-slate-800 bg-white p-4 rounded-md border shadow-sm min-h-[100px]"
    >
      {notebook.textContent}
    </div>
  </div>

  <div class="space-y-4 pt-4 border-t">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-muted-foreground">
        <ListTodo class="h-4 w-4" />
        <span class="text-sm font-medium uppercase tracking-wider"
          >Notas Adicionales</span
        >
      </div>
      <span
        class="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600"
      >
        {notebook.content?.tasks?.length || 0}
      </span>
    </div>

    {#if !notebook.content?.tasks || notebook.content.tasks.length === 0}
      <p
        class="text-sm text-center text-muted-foreground py-8 border border-dashed rounded-md italic"
      >
        No hay notas adicionales en este notebook.
      </p>
    {:else}
      <div
        class="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar"
      >
        {#each notebook.content.tasks as task, i}
          <div
            class="p-4 rounded-lg border bg-gradient-to-br from-white to-slate-50 shadow-sm border-l-4 border-l-blue-500"
          >
            <h4 class="text-sm font-bold text-slate-900 mb-1">
              {task.name || `Nota #${i + 1}`}
            </h4>
            <p
              class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed"
            >
              {task.contentText}
            </p>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="flex items-center gap-6 pt-6 border-t text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
  >
    <div class="flex items-center gap-1.5">
      <Calendar class="h-3.5 w-3.5" />
      <span>Creado: {dayjs(notebook.createdAt).format("DD/MM/YYYY HH:mm")}</span
      >
    </div>
    {#if notebook.assignedAt}
      <div class="flex items-center gap-1.5">
        <Calendar class="h-3.5 w-3.5" />
        <span>Asignado: {dayjs(notebook.assignedAt).format("DD/MM/YYYY")}</span>
      </div>
    {/if}
  </div>
</div>
