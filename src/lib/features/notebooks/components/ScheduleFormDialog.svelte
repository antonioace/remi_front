<script lang="ts">
  import { Smartphone, Mail, Loader2, ArrowLeft } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type {
    CreateNotebookScheduleDto,
    UpdateNotebookScheduleDto,
  } from "../types";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";

  interface Props {
    open: boolean;
    mode: "create" | "edit";
    form: CreateNotebookScheduleDto | UpdateNotebookScheduleDto;
    isSubmitting: boolean;
    editingStatus?: string | null;
    onSave: () => void;
    onClose: () => void;
  }

  let {
    open = $bindable(),
    mode,
    form = $bindable(),
    isSubmitting,
    editingStatus,
    onSave,
    onClose,
  }: Props = $props();

  const width = useWindowSize();
  let isMobile = $derived($width < 640);

  const channelsList = [
    { id: "push", label: "Notificación Push", icon: Smartphone },
    { id: "email", label: "Correo Electrónico", icon: Mail },
  ];

  function toggleChannel(id: string) {
    if (!form.channels) form.channels = [];
    if (form.channels.includes(id)) {
      form.channels = form.channels.filter((c: string) => c !== id);
    } else {
      form.channels = [...form.channels, id];
    }
  }

  function handleSave() {
    // Format dates to ISO before sending to backend
    if (form.date) form.date = new Date(form.date).toISOString();
    if (form.startDate)
      form.startDate = new Date(form.startDate).toISOString();
    if (form.endDate) form.endDate = new Date(form.endDate).toISOString();

    onSave();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class={isMobile
      ? "flex h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none border-0 p-0 overflow-hidden"
      : "sm:max-w-[500px] max-h-[90vh] overflow-y-auto"}
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
          onclick={onClose}
        >
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h2 class="text-base font-semibold text-slate-900">
            {mode === "create" ? "Crear Nueva" : "Editar"} Programación
          </h2>
        </div>
      </div>
    {:else}
      <Dialog.Header class="p-6 pb-0">
        <Dialog.Title
          >{mode === "create" ? "Crear Nueva" : "Editar"} Programación</Dialog.Title
        >
        <Dialog.Description>
          {mode === "create"
            ? "Configura los detalles de tu evento programado."
            : "Modifica los detalles de tu evento programado."}
        </Dialog.Description>
      </Dialog.Header>
    {/if}

    <div class="flex-1 overflow-y-auto px-6 space-y-5 py-4">
      <div class="space-y-2">
        <Label for="name">Nombre</Label>
        <Input
          id="name"
          bind:value={form.name}
          placeholder="Ej: Recordatorio de pago"
          disabled={mode === "edit" && editingStatus === "executed"}
        />
      </div>

      <div class="space-y-2">
        <Label for="desc">Descripción</Label>
        <Input
          id="desc"
          bind:value={form.description}
          placeholder="Detalles adicionales..."
          disabled={mode === "edit" && editingStatus === "executed"}
        />
      </div>

      <div class="space-y-2">
        <Label>Tipo de Programación</Label>
        <div class="flex gap-2">
          <Button
            variant={form.type === "normal" ? "default" : "outline"}
            class={form.type === "normal"
              ? "bg-[#a151fc] hover:bg-[#8e44e3]"
              : ""}
            onclick={() => (form.type = "normal")}
          >
            Normal
          </Button>
          <Button
            variant={form.type === "recurrent" ? "default" : "outline"}
            class={form.type === "recurrent"
              ? "bg-[#a151fc] hover:bg-[#8e44e3]"
              : ""}
            onclick={() => (form.type = "recurrent")}
          >
            Recurrente
          </Button>
        </div>
      </div>

      {#if form.type === "normal"}
        <div class="space-y-2">
          <Label for="date">Fecha y Hora</Label>
          <Input id="date" type="datetime-local" bind:value={form.date} />
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="startDate">Fecha Inicial</Label>
            <Input
              id="startDate"
              type="datetime-local"
              bind:value={form.startDate}
            />
          </div>
          <div class="space-y-2">
            <Label for="endDate">Fecha Final (Opcional)</Label>
            <Input
              id="endDate"
              type="datetime-local"
              bind:value={form.endDate}
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Intervalo de Repetición</Label>
          <div class="grid grid-cols-3 gap-2">
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400"
                >Días</span
              >
              <Input
                type="number"
                min="0"
                bind:value={form.interval!.days}
              />
            </div>
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400"
                >Horas</span
              >
              <Input
                type="number"
                min="0"
                max="23"
                bind:value={form.interval!.hours}
              />
            </div>
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400"
                >Mins</span
              >
              <Input
                type="number"
                min="0"
                max="59"
                bind:value={form.interval!.minutes}
              />
            </div>
          </div>
        </div>
      {/if}

      <div class="space-y-2">
        <Label>Canales de Notificación</Label>
        <div class="flex flex-wrap gap-2">
          {#each channelsList as channel (channel.id)}
            {@const Icon = channel.icon}
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 {form.channels?.includes(
                channel.id,
              )
                ? 'bg-[#a151fc] text-white border-[#a151fc]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#a151fc]'}"
              onclick={() => toggleChannel(channel.id)}
            >
              <Icon class="h-4 w-4" />
              {channel.label}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <Dialog.Footer class={isMobile ? "p-4 border-t" : "px-6 pb-6"}>
      <Button variant="outline" onclick={onClose}>Cancelar</Button>
      <Button
        class="bg-[#a151fc] hover:bg-[#8e44e3] text-white flex items-center gap-2"
        onclick={handleSave}
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader2 class="h-4 w-4 animate-spin" />
        {/if}
        {mode === "create" ? "Crear Programación" : "Guardar Cambios"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
