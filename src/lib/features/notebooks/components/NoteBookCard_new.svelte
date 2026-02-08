<script lang="ts">
  import type { Notebook } from "../types";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, Trash2, Edit, ListTodo, Eye } from "@lucide/svelte";
  import dayjs from "dayjs";

  let { notebook, onEdit, onDelete, onView } = $props<{
    notebook: Notebook;
    onEdit: (n: Notebook) => void;
    onDelete: (id: string) => void;
    onView: (n: Notebook) => void;
  }>();
</script>

<Card class="hover:shadow-md transition-shadow border-slate-200">
  <CardHeader>
    <div class="flex items-start justify-between">
      <div>
        <CardTitle class="text-slate-900 group-hover:text-[#a151fc] transition-colors">{notebook.name}</CardTitle>
        <CardDescription class="line-clamp-2 mt-1"
          >{notebook.description || "Sin descripción"}</CardDescription
        >
      </div>
      {#if notebook.content?.tasks && notebook.content.tasks.length > 0}
        <div
          class="flex items-center gap-1 rounded-full bg-[#a151fc]/10 px-2.5 py-1 text-[10px] font-medium text-[#a151fc]"
        >
          <ListTodo class="h-3 w-3" />
          {notebook.content.tasks.length}
        </div>
      {/if}
    </div>
  </CardHeader>
  <CardContent>
    <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed">
      {notebook.textContent}
    </p>
  </CardContent>
  <CardFooter class="flex flex-col items-start gap-4 border-t border-slate-100 pt-4 mt-auto">
    <div
      class="flex w-full items-center justify-between text-xs text-muted-foreground"
    >
      <div class="flex items-center gap-1">
        <Calendar class="h-3 w-3" />
        <span>{dayjs(notebook.createdAt).format("DD/MM/YYYY")}</span>
      </div>
      {#if notebook.assignedAt}
        <span class="text-[#a151fc] font-medium">Asignado: {dayjs(notebook.assignedAt).format("DD/MM/YYYY")}</span>
      {/if}
    </div>
    <div class="flex w-full justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-[#a151fc] hover:text-[#a151fc] hover:bg-[#a151fc]/10"
        onclick={() => onView(notebook)}
        title="Ver Detalles"
      >
        <Eye class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-slate-500 hover:text-[#a151fc] hover:bg-[#a151fc]/10"
        onclick={() => onEdit(notebook)}
        title="Editar"
      >
        <Edit class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
        onclick={() => onDelete(notebook.id)}
        title="Eliminar"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </CardFooter>
</Card>
