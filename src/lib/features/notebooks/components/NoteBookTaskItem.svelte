<script lang="ts">
  import { Trash2, Copy, Maximize2 } from "@lucide/svelte";
  import EditableText from "$lib/components/EditableText.svelte";
  import TruncateText from "$lib/components/TruncateText.svelte";
  import type { NoteTask } from "../types";
  import { toast } from "svelte-sonner";

  let { task, onUpdate, onDelete, onExpand } = $props<{
    task: NoteTask;
    onUpdate: (val: string) => Promise<void>;
    onDelete: () => void;
    onExpand: () => void;
  }>();

  let isEditing = $state(false);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(task.contentText);
      toast.success("Contenido copiado al portapapeles");
    } catch (err) {
      console.error(err);
      toast.error("Error al copiar el contenido");
    }
  }
</script>

<div
  class="rounded-xl bg-slate-50/50 border border-slate-100 group relative flex flex-col"
>
  <!-- Content Area -->
  <div class="p-4 flex-1">
    <EditableText
      value={task.contentText}
      bind:isEditing
      isTextarea={true}
      onSave={onUpdate}
    >
      <TruncateText
        text={task.contentText}
        lines={5}
        side="right"
        class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed pr-0 sm:pr-24"
      />
    </EditableText>
  </div>

  <!-- Actions Row -->
  <div
    class="flex items-center justify-end gap-1 p-2 sm:p-0 border-t border-slate-100 sm:border-0 sm:absolute sm:top-2 sm:right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
  >
    <button
      onclick={(e) => {
        e.stopPropagation();
        copyContent();
      }}
      class="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full shadow-sm border border-slate-100"
      title="Copiar contenido"
    >
      <Copy class="h-4 w-4" />
    </button>
    <button
      onclick={(e) => {
        e.stopPropagation();
        onExpand();
      }}
      class="p-2 bg-white hover:bg-[#a151fc]/5 text-slate-400 hover:text-[#a151fc] rounded-full shadow-sm border border-slate-100"
      title="Pantalla completa"
    >
      <Maximize2 class="h-4 w-4" />
    </button>
    <button
      onclick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      class="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full shadow-sm border border-slate-100"
      title="Eliminar nota"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</div>
