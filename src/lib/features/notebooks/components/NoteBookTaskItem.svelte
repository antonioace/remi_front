<script lang="ts">
  import { Trash2 } from "@lucide/svelte";
  import EditableText from "$lib/components/EditableText.svelte";
  import type { NoteTask } from "../types";

  let { task, onUpdate, onDelete } = $props<{
    task: NoteTask;
    onUpdate: (val: string) => Promise<void>;
    onDelete: () => void;
  }>();

  let isEditing = $state(false);
</script>

<div
  class="p-4 rounded-xl bg-slate-50/50 border border-slate-100 group relative"
>
  <div
    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
  >
    <button
      onclick={onDelete}
      class="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full shadow-sm border border-slate-100"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>

  <EditableText
    value={task.contentText}
    bind:isEditing
    isTextarea={true}
    onSave={onUpdate}
  >
    <p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed pr-10">
      {task.contentText}
    </p>
  </EditableText>
</div>
