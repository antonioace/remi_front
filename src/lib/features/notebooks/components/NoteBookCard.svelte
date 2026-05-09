<script lang="ts">
  import type { Notebook } from "../types";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import {
    Calendar,
    Trash2,
    Edit,
    Eye,
    MoreHorizontal,
    Mic,
    StickyNote,
    Image,
  } from "@lucide/svelte";
  import AudioManager from "../../audio/components/AudioManager.svelte";
  import { goto } from "$app/navigation";
  import dayjs from "dayjs";
  import "dayjs/locale/es";
  import TruncateText from "$lib/components/TruncateText.svelte";

  let { notebook, onEdit, onDelete } = $props<{
    notebook: Notebook;
    onEdit: (n: Notebook) => void;
    onDelete: (id: string) => void;
  }>();

  let showAudio = $state(false);
</script>

<!-- Card Container -->
<div
  class="group relative flex flex-col rounded-2xl bg-white p-6 transition-all border border-[#E4E4fE4]"
>
  <!-- Top Row: Badge, Date & Actions -->
  <div class="absolute top-6 right-6 flex items-center justify-end">
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
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <DropdownMenu.Item
            onclick={() => {
              goto(`/dashboard/notebooks/${notebook.id}`).catch(() => {});
            }}
          >
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
  <div class="mb-1 max-w-[calc(100%-140px)]">
    <a
      href="/dashboard/notebooks/{notebook.id}"
      class="text-lg font-bold leading-tight tracking-tight text-slate-900 transition-colors hover:text-[#a151fc] block"
    >
      <TruncateText text={notebook.name} lines={1} />
    </a>
  </div>

  <TruncateText
    text={notebook.description || notebook.textContent}
    lines={3}
    class="mb-5 mt-2 text-sm leading-relaxed text-slate-500"
  />

  <!-- Tags -->
  {#if notebook.content?.tags && notebook.content.tags.length > 0}
    <div class="mb-6 flex flex-wrap gap-2">
      {#each notebook.content.tags as tag (tag)}
        <span
          class="inline-flex items-center rounded-lg border border-[#a151fc]/10 bg-[#a151fc]/5 px-2.5 py-1 text-xs font-semibold text-[#a151fc] transition-colors hover:bg-[#a151fc]/10"
        >
          {tag}
        </span>
      {/each}
    </div>
  {/if}

  <!-- Footer -->
  <div class="mt-auto flex items-center justify-between pt-4">
    <div class="flex items-center gap-5">
      <div class="flex items-center gap-1.5 text-slate-500" title="Anotaciones">
        <StickyNote class="h-4 w-4 text-[#a151fc]" />
        <span class="text-xs font-bold"
          >{notebook.content?.tasks?.length || 0}</span
        >
      </div>
      <div class="flex items-center gap-1.5 text-slate-500" title="Imágenes">
        <Image class="h-4 w-4 text-[#a151fc]" />
        <span class="text-xs font-bold"
          >{notebook.content?.images?.length || 0}</span
        >
      </div>
    </div>
  </div>
</div>

<AudioManager notebookId={notebook.id} bind:open={showAudio} />
