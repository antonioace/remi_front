<script lang="ts">
  import type { Notebook } from "../types";
  import { Button } from "$lib/components/ui/button";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import {
    Calendar,
    Trash2,
    Edit,
    Eye,
    Flag,
    MoreHorizontal,
    Mic,
  } from "@lucide/svelte";
  import AudioManager from "../../audio/components/AudioManager.svelte";
  import dayjs from "dayjs";
  import "dayjs/locale/es";

  let { notebook, onEdit, onDelete, onView } = $props<{
    notebook: Notebook;
    onEdit: (n: Notebook) => void;
    onDelete: (id: string) => void;
    onView: (n: Notebook) => void;
  }>();

  const hasTasks = $derived(
    notebook.content?.tasks && notebook.content.tasks.length > 0,
  );
  let showAudio = $state(false);
</script>

<!-- Card Container -->
<div
  class="group relative flex flex-col rounded-3xl bg-white p-6 transition-all hover:shadow-sm"
>
  <!-- Top Row: Badge, Date & Actions -->
  <div class="mb-4 flex items-center justify-between">
    <div
      class="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600"
    >
      <Flag class="h-3 w-3 fill-orange-600" />
      <span>Alta</span>
    </div>

    <div class="flex items-center gap-3">
      <div
        class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <Calendar class="h-3.5 w-3.5 text-slate-400" />
        <span>{dayjs(notebook.createdAt).format("DD MMM YYYY")}</span>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost" size="icon" class="h-6 w-6 rounded-full">
            <MoreHorizontal class="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onclick={() => onView(notebook)}>
            <Eye class="mr-2 h-4 w-4" />
            <span>Ver Detalles</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => onEdit(notebook)}>
            <Edit class="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => (showAudio = true)}>
            <Mic class="mr-2 h-4 w-4" />
            <span>Audios</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            class="text-red-600 focus:text-red-600"
            onclick={() => onDelete(notebook.id)}
          >
            <Trash2 class="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  <!-- Middle: Content -->
  <div class="mb-1">
    <h3
      class="text-lg font-bold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-[#a151fc]"
    >
      {notebook.name}
    </h3>
  </div>

  <p class="mb-5 mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
    {notebook.description || notebook.textContent}
  </p>

  <!-- Tags -->
  <div class="mb-6 flex flex-wrap gap-2">
    {#if hasTasks}
      <span
        class="inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
      >
        # Tareas: {notebook.content?.tasks?.length}
      </span>
    {/if}
    <span
      class="inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
    >
      # Notebook
    </span>
  </div>

  <!-- Divider -->
  <div class="border-t border-dashed border-slate-200"></div>

  <!-- Footer -->
  <div class="mt-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <Avatar.Root class="h-8 w-8 border-2 border-white shadow-sm">
        <Avatar.Image
          src="https://api.dicebear.com/7.x/notionists/svg?seed={notebook.id}"
          alt="Avatar"
        />
        <Avatar.Fallback>US</Avatar.Fallback>
      </Avatar.Root>
      <span class="text-sm font-bold text-slate-700">Usuario</span>
    </div>
  </div>
</div>

<AudioManager notebookId={notebook.id} bind:open={showAudio} />
