<script lang="ts">
  import { notebookService } from "../services/notebook.service";
  import { Button } from "$lib/components/ui/button";
  import {
    Loader2,
    Mic,
    Square,
    ArrowLeft,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";

  let { open = $bindable(false), onSuccess } = $props<{
    open?: boolean;
    onSuccess: () => void;
  }>();

  let isUploading = $state(false);
  let isRecording = $state(false);
  let mediaRecorder = $state<MediaRecorder | null>(null);
  let audioChunks = $state<Blob[]>([]);
  let recordingTime = $state(0);
  let timerInterval: ReturnType<typeof setInterval>;

  // Detection for mobile
  const width = useWindowSize();
  let isMobile = $derived($width < 640);

  function startTimer() {
    recordingTime = 0;
    timerInterval = setInterval(() => {
      recordingTime++;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

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
        
        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      isRecording = true;
      startTimer();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("No se pudo acceder al micrófono");
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      stopTimer();
    }
  }

  async function handleUpload(file: File) {
    isUploading = true;
    toast.info("Procesando audio y creando notebook...");
    
    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const result = await notebookService.createFromAudio(file, timezone);
    
    if (result.success) {
      toast.success("Notebook creado exitosamente");
      open = false;
      onSuccess();
    } else {
      toast.error(result.error || "Error al crear notebook desde audio");
    }
    isUploading = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class={isMobile
      ? "flex h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none border-0 p-0"
      : "sm:max-w-[400px]"}
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
            Crear Audio Note
          </h2>
        </div>
      </div>
    {:else}
      <Dialog.Header>
        <Dialog.Title>Crear Audio Note</Dialog.Title>
        <Dialog.Description>
          Graba o sube un audio para generar un notebook con IA.
        </Dialog.Description>
      </Dialog.Header>
    {/if}

    <div class="flex-1 overflow-hidden p-6 flex flex-col justify-center items-center gap-8">
      
      <!-- Recording Status -->
      {#if isRecording}
        <div class="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div class="relative flex items-center justify-center">
             <div class="h-24 w-24 rounded-full bg-red-50 animate-pulse absolute"></div>
             <div class="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 relative z-10">
                <Mic class="h-10 w-10" />
             </div>
          </div>
          <div class="flex flex-col items-center gap-1">
             <span class="text-2xl font-bold tabular-nums text-slate-700">
               {formatTime(recordingTime)}
             </span>
             <span class="text-xs text-red-500 font-medium tracking-wide uppercase">Grabando</span>
          </div>
        </div>
      {:else}
         <!-- Initial State -->
        <div class="flex flex-col items-center gap-4 text-center">
            <div class="h-20 w-20 rounded-full bg-[#f4f7fe] flex items-center justify-center text-[#a151fc]">
                <Mic class="h-10 w-10" />
            </div>
            <p class="text-sm text-slate-500 max-w-[200px]">
                Presiona el micrófono para comenzar a grabar tu nota de voz.
            </p>
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex flex-col gap-3 w-full">
         {#if isRecording}
            <Button 
                onclick={stopRecording}
                size="lg"
                variant="destructive"
                class="w-full rounded-xl h-14 font-semibold text-lg shadow-lg shadow-red-200 hover:shadow-red-300 transition-all"
            >
                <Square class="mr-2 h-5 w-5 fill-current" />
                Detener
            </Button>
         {:else}
            <Button
                disabled={isUploading}
                onclick={startRecording}
                size="lg"
                class="w-full rounded-xl h-14 font-semibold text-lg bg-[#a151fc] hover:bg-[#8e44e3] shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
            >
                {#if isUploading}
                    <Loader2 class="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                {:else}
                    <div class="flex items-center">
                       <Mic class="mr-2 h-5 w-5" />
                       Grabar
                    </div>
                {/if}
            </Button>
         {/if}
      </div>

    </div>
  </Dialog.Content>
</Dialog.Root>
