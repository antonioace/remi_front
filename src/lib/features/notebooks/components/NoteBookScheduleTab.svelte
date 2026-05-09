<script lang="ts">
  import { Plus, BellRing, Loader2 } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import dayjs from "dayjs";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { notebookScheduleService } from "../services/notebook-schedule.service";
  import type {
    NotebookSchedule,
    CreateNotebookScheduleDto,
    UpdateNotebookScheduleDto,
    NotebookEvent,
  } from "../types";

  // Components
  import ScheduleCard from "./ScheduleCard.svelte";
  import ScheduleHistorySheet from "./ScheduleHistorySheet.svelte";
  import ScheduleFormDialog from "./ScheduleFormDialog.svelte";

  let { notebookId } = $props<{ notebookId: string }>();

  // State
  let schedules = $state<NotebookSchedule[]>([]);
  let isLoading = $state(true);
  let isSubmitting = $state(false);

  // Dialogs Visibility
  let isCreateOpen = $state(false);
  let isEditOpen = $state(false);
  let isHistoryOpen = $state(false);
  let isConfirmOpen = $state(false);
  let isDeleteConfirmOpen = $state(false);

  // Form State
  let createForm = $state<CreateNotebookScheduleDto>({
    name: "",
    description: "",
    type: "normal",
    date: "",
    startDate: "",
    endDate: "",
    interval: { days: 0, hours: 0, minutes: 0 },
    channels: [],
  });

  let editForm = $state<UpdateNotebookScheduleDto>({});
  let editingId = $state<string | null>(null);
  let editingStatus = $state<string | null>(null);

  // History State
  let historyEvents = $state<NotebookEvent[]>([]);
  let isLoadingHistory = $state(false);

  // Pending Actions
  let pendingToggle = $state<{ id: string; value: boolean } | null>(null);
  let pendingDeleteId = $state<string | null>(null);

  async function loadSchedules() {
    isLoading = true;
    const res = await notebookScheduleService.getSchedules(notebookId);
    if (res.success && res.data) {
      schedules = res.data;
    }
    isLoading = false;
  }

  onMount(loadSchedules);

  async function handleCreate() {
    if (!createForm.name) return toast.error("El nombre es obligatorio");
    if (createForm.type === "normal" && !createForm.date)
      return toast.error("La fecha es obligatoria");
    if (createForm.type === "recurrent" && !createForm.startDate)
      return toast.error("La fecha inicial es obligatoria");
    if (createForm.channels.length === 0)
      return toast.error("Selecciona al menos un canal");

    isSubmitting = true;
    const res = await notebookScheduleService.createSchedule(
      notebookId,
      createForm,
    );
    if (res.success) {
      toast.success("Programación creada");
      isCreateOpen = false;
      await loadSchedules();
      resetCreateForm();
    } else {
      toast.error("Error al crear");
    }
    isSubmitting = false;
  }

  function resetCreateForm() {
    createForm = {
      name: "",
      description: "",
      type: "normal",
      date: "",
      startDate: "",
      endDate: "",
      interval: { days: 0, hours: 0, minutes: 0 },
      channels: [],
    };
  }

  function openEdit(schedule: NotebookSchedule) {
    editingId = schedule.id;
    editingStatus = schedule.status;
    editForm = {
      name: schedule.name,
      description: schedule.description,
      type: schedule.type,
      date: schedule.date
        ? dayjs(schedule.date).format("YYYY-MM-DDTHH:mm")
        : "",
      startDate: schedule.startDate
        ? dayjs(schedule.startDate).format("YYYY-MM-DDTHH:mm")
        : "",
      endDate: schedule.endDate
        ? dayjs(schedule.endDate).format("YYYY-MM-DDTHH:mm")
        : "",
      interval: { ...schedule.interval },
      channels: [...schedule.channels],
    };
    isEditOpen = true;
  }

  async function handleUpdate() {
    if (!editingId || !editForm.name) return;
    isSubmitting = true;
    const res = await notebookScheduleService.updateSchedule(
      editingId,
      editForm,
    );
    if (res.success) {
      toast.success("Programación actualizada");
      isEditOpen = false;
      await loadSchedules();
    } else {
      toast.error("Error al actualizar");
    }
    isSubmitting = false;
  }

  async function openHistory(schedule: NotebookSchedule) {
    isHistoryOpen = true;
    isLoadingHistory = true;
    const res = await notebookScheduleService.getScheduleEvents(schedule.id);
    if (res.success && res.data) historyEvents = res.data;
    isLoadingHistory = false;
  }

  function confirmToggle(id: string, currentValue: boolean) {
    pendingToggle = { id, value: !currentValue };
    isConfirmOpen = true;
  }

  async function handleToggle() {
    if (!pendingToggle) return;
    const { id, value } = pendingToggle;
    const target = schedules.find((s) => s.id === id);
    if (!target) return;

    let updateData: UpdateNotebookScheduleDto = { isEnabled: value };
    if (value === true && target.type === "normal") {
      updateData = { isEnabled: false, status: "executed" };
    }

    const res = await notebookScheduleService.updateSchedule(id, updateData);
    if (res.success) {
      toast.success(
        updateData.status === "executed"
          ? "Programación ejecutada"
          : value
            ? "Activada"
            : "Desactivada",
      );
      await loadSchedules();
    } else {
      toast.error("Error al actualizar");
    }
    isConfirmOpen = false;
    pendingToggle = null;
  }

  function confirmDelete(id: string) {
    pendingDeleteId = id;
    isDeleteConfirmOpen = true;
  }

  async function handleDelete() {
    if (!pendingDeleteId) return;
    const res = await notebookScheduleService.deleteSchedule(pendingDeleteId);
    if (res.success) {
      toast.success("Eliminada");
      await loadSchedules();
    } else {
      toast.error("Error al eliminar");
    }
    isDeleteConfirmOpen = false;
    pendingDeleteId = null;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="space-y-1">
      <h3 class="text-lg font-bold text-slate-900">Alarmas</h3>
      <p class="text-sm text-slate-500">
        Configura avisos y recordatorios automáticos.
      </p>
    </div>
    <Button
      variant="outline"
      class="bg-white border-[#a151fc] text-[#a151fc] hover:bg-[#a151fc]/10 flex items-center gap-2 w-full sm:w-auto justify-center"
      onclick={() => (isCreateOpen = true)}
    >
      <Plus class="h-4 w-4" />
      Nueva Programación
    </Button>
  </div>

  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-20 px-4">
      <Loader2 class="h-10 w-10 animate-spin text-[#a151fc] opacity-40" />
      <p class="mt-4 text-sm text-slate-500 font-medium">
        Cargando programaciones...
      </p>
    </div>
  {:else if schedules.length === 0}
    <div
      class="flex flex-col items-center justify-center py-16 px-4 rounded-2xl"
    >
      <div
        class="h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-slate-50"
      >
        <BellRing class="h-8 w-8 text-slate-400" />
      </div>
      <p class="text-slate-500 font-medium">No hay eventos programados</p>
      <p class="text-xs text-slate-400 mt-1 text-center max-w-[250px]">
        Configura una programación para recibir notificaciones automáticas sobre
        este notebook.
      </p>
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      {#each schedules as schedule (schedule.id)}
        <ScheduleCard
          {schedule}
          onToggle={confirmToggle}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onHistory={openHistory}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Forms -->
<ScheduleFormDialog
  bind:open={isCreateOpen}
  mode="create"
  bind:form={createForm}
  {isSubmitting}
  onSave={handleCreate}
  onClose={() => (isCreateOpen = false)}
/>

<ScheduleFormDialog
  bind:open={isEditOpen}
  mode="edit"
  bind:form={editForm}
  {isSubmitting}
  {editingStatus}
  onSave={handleUpdate}
  onClose={() => (isEditOpen = false)}
/>

<!-- History -->
<ScheduleHistorySheet
  bind:open={isHistoryOpen}
  events={historyEvents}
  isLoading={isLoadingHistory}
/>

<!-- Confirmations -->
<Dialog.Root bind:open={isConfirmOpen}>
  <Dialog.Content class="sm:max-w-[400px]">
    <Dialog.Header>
      <Dialog.Title>Confirmar acción</Dialog.Title>
      <Dialog.Description>
        ¿Estás seguro de que deseas {pendingToggle?.value
          ? "activar"
          : "desactivar"} esta programación?
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer class="flex gap-2">
      <Button variant="outline" onclick={() => (isConfirmOpen = false)}>
        Cancelar
      </Button>
      <Button
        class="bg-[#a151fc] hover:bg-[#8e44e3] text-white"
        onclick={handleToggle}
      >
        Confirmar
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isDeleteConfirmOpen}>
  <Dialog.Content class="sm:max-w-[400px]">
    <Dialog.Header>
      <Dialog.Title>Eliminar programación</Dialog.Title>
      <Dialog.Description>
        ¿Estás seguro de que deseas eliminar esta programación? Esta acción no
        se puede deshacer.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer class="flex gap-2">
      <Button variant="outline" onclick={() => (isDeleteConfirmOpen = false)}>
        Cancelar
      </Button>
      <Button
        variant="destructive"
        class="bg-red-500 hover:bg-red-600 text-white"
        onclick={handleDelete}
      >
        Eliminar
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
