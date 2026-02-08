<script lang="ts">
    import { audioService } from "../services/audio.service";
    import type { Audio } from "../types";
    import { Button } from "$lib/components/ui/button";
    import {
        Loader2,
        Plus,
        FileAudio,
        ArrowLeft,
        Mic,
        Square,
        Trash2,
    } from "@lucide/svelte";
    import { toast } from "svelte-sonner";
    import dayjs from "dayjs";
    import * as Dialog from "$lib/components/ui/dialog";
    import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";

    let { notebookId, open = $bindable(false) } = $props<{
        notebookId: string;
        open?: boolean;
    }>();

    let audios = $state<Audio[]>([]);
    let isLoading = $state(false);
    let isUploading = $state(false);
    let isRecording = $state(false);
    let mediaRecorder = $state<MediaRecorder | null>(null);
    let audioChunks = $state<Blob[]>([]);
    let fileInput: HTMLInputElement;

    const width = useWindowSize();
    let isMobile = $derived($width < 640);

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
                    type: "audio/webm",
                });
                await handleUpload(file);
                
                // Stop all tracks to release microphone
                 stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            isRecording = true;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("No se pudo acceder al micrófono");
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
        }
    }

    async function loadAudios() {
        isLoading = true;
        const result = await audioService.getByNotebook(notebookId);
        if (result.success && result.data) {
            audios = result.data;
        }
        isLoading = false;
    }

    async function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            await handleUpload(file);
        }
        // Reset value so same file can be selected again if needed
        target.value = "";
    }

    async function handleUpload(file: File) {
        isUploading = true;
        toast.info("Subiendo audio...");
        const result = await audioService.upload(file, notebookId);
        if (result.success && result.data) {
            toast.success("Audio subido correctamente");
            // Prepend new audio
            audios = [result.data, ...audios];
        } else {
            toast.error(result.error || "Error al subir audio");
        }
        isUploading = false;
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de que quieres eliminar este audio?")) return;

        const result = await audioService.remove(id);
        if (result.success) {
            toast.success("Audio eliminado");
            audios = audios.filter((a) => a.id !== id);
        } else {
            toast.error(result.error || "Error al eliminar audio");
        }
    }

    // Effect to load audios when dialog opens
    $effect(() => {
        if (open) {
            loadAudios();
        }
    });
</script>

<Dialog.Root bind:open>
    <Dialog.Content
        class={isMobile
            ? "flex h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none border-0 p-0"
            : "sm:max-w-[500px]"}
        showCloseButton={!isMobile}
    >
        {#if isMobile}
            <div
                class="flex items-center gap-2 border-b border-slate-100 bg-white p-4"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    class="-ml-2 h-9 w-9 text-slate-500"
                    onclick={() => (open = false)}
                >
                    <ArrowLeft class="h-5 w-5" />
                </Button>
                <div>
                    <h2 class="text-base font-semibold text-slate-900">
                        Audios del Notebook
                    </h2>
                </div>
            </div>
        {:else}
            <Dialog.Header>
                <Dialog.Title>Audios del Notebook</Dialog.Title>
                <Dialog.Description>
                    Gestiona las grabaciones y transcripciones asociadas.
                </Dialog.Description>
            </Dialog.Header>
        {/if}

        <div class="flex-1 overflow-hidden p-4">
            <div class="flex h-full flex-col space-y-4">
                <!-- Actions -->
                <div class="flex justify-end gap-2">
                    <input
                        type="file"
                        accept="audio/*"
                        class="hidden"
                        bind:this={fileInput}
                        onchange={handleFileSelect}
                    />
                    
                    {#if isRecording}
                         <Button
                            onclick={stopRecording}
                            variant="destructive"
                            class="animate-pulse"
                        >
                            <Square class="mr-2 h-4 w-4 fill-current" />
                            Detener Grabación
                        </Button>
                    {:else}
                         <Button
                            onclick={() => fileInput.click()}
                            variant="outline"
                            disabled={isUploading}
                        >
                            Subir Archivo
                        </Button>
                         <Button
                            onclick={startRecording}
                            disabled={isUploading}
                            class="bg-[#a151fc] hover:bg-[#8e44e3] text-white"
                        >
                            {#if isUploading}
                                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                                Subiendo...
                            {:else}
                                <Mic class="mr-2 h-4 w-4" />
                                Grabar Audio
                            {/if}
                        </Button>
                    {/if}
                </div>

                <!-- List -->
                <div class="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {#if isLoading}
                        <div class="flex justify-center p-4">
                            <Loader2
                                class="h-6 w-6 animate-spin text-slate-400"
                            />
                        </div>
                    {:else if audios.length === 0}
                        <div class="text-center py-8 text-slate-500 text-sm">
                            No hay audios registrados.
                        </div>
                    {:else}
                        {#each audios as audio}
                            <div
                                class="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50"
                            >
                                <div class="flex items-start justify-between">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="bg-white p-2 rounded-full border border-slate-100"
                                        >
                                            <FileAudio
                                                class="h-4 w-4 text-[#a151fc]"
                                            />
                                        </div>
                                        <span
                                            class="text-xs font-medium text-slate-500"
                                        >
                                            {dayjs(audio.createdAt).format(
                                                "DD MMM YYYY, HH:mm",
                                            )}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onclick={() => handleDelete(audio.id)}
                                    >
                                        <Trash2 class="h-4 w-4" />
                                    </Button>
                                </div>

                                {#if audio.transcription}
                                    <p
                                        class="text-sm text-slate-700 leading-relaxed pl-1"
                                    >
                                        {audio.transcription}
                                    </p>
                                {:else}
                                    <span
                                        class="text-xs text-slate-400 italic pl-1"
                                        >Sin transcripción disponible</span
                                    >
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
