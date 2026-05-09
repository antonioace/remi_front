<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Mic, Loader2, FileAudio, Trash2 } from "@lucide/svelte";
  import dayjs from "dayjs";
  import type { Audio } from "$lib/features/audio/types";
  import { audioService } from "$lib/features/audio/services/audio.service";
  import AudioManager from "$lib/features/audio/components/AudioManager.svelte";
  import { onMount } from "svelte";

  interface Props {
    notebookId: string;
  }
  let { notebookId }: Props = $props();

  let audios = $state<Audio[]>([]);
  let isLoadingAudios = $state(false);
  let isAudioOpen = $state(false);

  $effect(() => {
    if (!isAudioOpen) {
      loadAudios(); // Refresh audios when AudioManager closes
    }
  });

  onMount(() => loadAudios());

  async function loadAudios() {
    isLoadingAudios = true;
    const res = await audioService.getByNotebook(notebookId);
    if (res.success && res.data) {
      audios = res.data;
    }
    isLoadingAudios = false;
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este audio?")) return;
    const res = await audioService.remove(id);
    if (res.success) {
      audios = audios.filter(a => a.id !== id);
    }
  }
</script>

<div class="mb-6 flex items-center justify-between">
  <Button
    variant="outline"
    class="w-full sm:w-auto sm:ml-auto gap-2 text-[#a151fc] border-[#a151fc] hover:bg-[#a151fc]/5 justify-center"
    onclick={() => (isAudioOpen = true)}
  >
    <Mic class="h-4 w-4" />
    Gestionar Audios
  </Button>
</div>

{#if isLoadingAudios}
  <div class="flex items-center gap-2 text-slate-500 text-sm">
    <Loader2 class="h-4 w-4 animate-spin" /> Cargando audios...
  </div>
{:else if audios.length === 0}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="rounded-full bg-slate-50 p-4 mb-4">
      <FileAudio class="h-8 w-8 text-slate-300" />
    </div>
    <p class="text-sm font-medium text-slate-400">Sin audios registrados</p>
    <p class="text-xs text-slate-300 mt-1">Usa "Gestionar Audios" para grabar o subir uno</p>
  </div>
{:else}
  <div class="space-y-3">
    {#each audios as audio (audio.id)}
      <div
        class="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-white p-2.5 rounded-full border border-slate-100">
              <FileAudio class="h-4 w-4 text-[#a151fc]" />
            </div>
            <span class="text-xs font-semibold text-slate-500">
              {dayjs(audio.createdAt).format("DD MMM YYYY, HH:mm")}
            </span>
          </div>
          <button
            onclick={() => handleDelete(audio.id)}
            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        {#if audio.transcription}
          <p class="text-sm text-slate-700 leading-relaxed mt-2">
            {audio.transcription}
          </p>
        {:else}
          <span class="text-xs text-slate-400 italic mt-2"
            >Sin transcripción disponible</span
          >
        {/if}
      </div>
    {/each}
  </div>
{/if}

<AudioManager {notebookId} bind:open={isAudioOpen} />
