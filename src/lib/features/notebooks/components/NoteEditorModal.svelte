<script lang="ts">
  import { ArrowLeft, Save, Loader2, Paperclip } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";
  import { toast } from "svelte-sonner";

  interface Props {
    open: boolean;
    value: string;
    onSave: (val: string) => void;
    onClose: () => void;
    isSaving?: boolean;
  }

  let {
    open = $bindable(),
    value = $bindable(),
    onSave,
    onClose,
    isSaving = false,
  }: Props = $props();

  const width = useWindowSize();
  let isMobile = $derived($width < 640);

  function handleSave() {
    onSave(value);
  }

  async function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "txt" && extension !== "json") {
      toast.error("Solo se permiten archivos .txt o .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        value = content.trim();
        toast.success(`Contenido de "${file.name}" cargado`);
      }
      target.value = "";
    };
    reader.onerror = () => toast.error("Error al leer el archivo");
    reader.readAsText(file);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="flex min-w-full w-screen h-screen flex-col gap-0 rounded-none border-0 p-0 overflow-hidden bg-white top-0 left-0 translate-x-0 translate-y-0"
    showCloseButton={false}
  >
    <!-- Custom Header -->
    <div
      class="flex items-center justify-between border-b border-slate-100 bg-white p-4"
    >
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="-ml-2 h-9 w-9 text-slate-500"
          onclick={onClose}
        >
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <h2 class="text-base font-semibold text-slate-900">Editor de Nota</h2>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 text-slate-500 border-slate-200"
            title="Importar archivo"
          >
            <Paperclip class="h-4 w-4" />
          </Button>
          <input
            type="file"
            accept=".txt,.json"
            class="absolute inset-0 opacity-0 cursor-pointer"
            onchange={handleFileUpload}
          />
        </div>

        <Button
          variant="default"
          class="bg-[#a151fc] hover:bg-[#8e44e3] text-white flex items-center gap-2 rounded-xl h-9"
          onclick={handleSave}
          disabled={isSaving}
        >
          {#if isSaving}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Save class="h-4 w-4" />
          {/if}
          <span class={isMobile ? "hidden" : "inline"}>Guardar Nota</span>
          {#if isMobile}
            <span>Guardar</span>
          {/if}
        </Button>
      </div>
    </div>

    <!-- Giant Input Area -->
    <div class="flex-1 bg-slate-50/30 p-6 md:p-10">
      <textarea
        bind:value
        placeholder="Escribe aquí tu nota con total libertad..."
        class="w-full h-full bg-transparent border-none focus:ring-0 text-lg md:text-xl text-slate-800 placeholder:text-slate-300 resize-none outline-none font-medium leading-relaxed"
        autofocus
      ></textarea>
    </div>
  </Dialog.Content>
</Dialog.Root>
