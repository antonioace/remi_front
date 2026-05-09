<script lang="ts">
  import {
    Bell,
    Clock,
    Calendar,
    Repeat,
    CheckCircle2,
    Activity,
    Pencil,
    Trash2,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import dayjs from "dayjs";
  import type { NotebookSchedule } from "../types";

  interface Props {
    schedule: NotebookSchedule;
    onToggle: (id: string, value: boolean) => void;
    onEdit: (schedule: NotebookSchedule) => void;
    onDelete: (id: string) => void;
    onHistory: (schedule: NotebookSchedule) => void;
  }

  let { schedule, onToggle, onEdit, onDelete, onHistory }: Props = $props();
</script>

<div
  class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group gap-4"
>
  <!-- Top Section: Icon & Info -->
  <div class="flex items-start gap-4">
    <div
      class="h-10 w-10 rounded-lg shrink-0 {schedule.isEnabled
        ? 'bg-[#a151fc]/10 text-[#a151fc]'
        : 'bg-slate-100 text-slate-400'} flex items-center justify-center transition-colors mt-1"
    >
      <Bell class="h-5 w-5" />
    </div>
    <div class="flex-1 min-w-0">
      <p
        class="font-bold line-clamp-2 {schedule.isEnabled
          ? 'text-slate-900'
          : 'text-slate-400'} transition-colors"
      >
        {schedule.name}
      </p>
      
      <div class="flex flex-wrap items-center gap-2 mt-1.5">
        <div
          class="flex items-center gap-1 text-[11px] text-slate-400 font-medium uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
        >
          <Clock class="h-3 w-3" />
          <span>
            {#if schedule.type === "normal"}
              {dayjs(schedule.date).format("DD MMM, HH:mm")}
            {:else}
              {dayjs(schedule.startDate).format("DD MMM")}
            {/if}
          </span>
        </div>
        <Badge
          variant="outline"
          class="px-1.5 h-5 bg-white border-slate-100 text-slate-500 text-[10px]"
        >
          {#if schedule.type === "normal"}
            <Calendar class="h-3 w-3 mr-1" /> Puntual
          {:else}
            <Repeat class="h-3 w-3 mr-1" /> Recurrente
          {/if}
        </Badge>
        <Badge
          class="px-1.5 h-5 text-[10px] {schedule.status === 'executed'
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-blue-50 text-blue-700 border-blue-100'}"
        >
          {#if schedule.status === "executed"}
            <CheckCircle2 class="h-3 w-3 mr-1" /> Ejecutado
          {:else}
            <Clock class="h-3 w-3 mr-1" /> Pendiente
          {/if}
        </Badge>
      </div>

      {#if schedule.lastExecutionAt}
        <div
          class="flex items-center gap-1 mt-1.5 text-[10px] text-green-600 font-medium"
        >
          <CheckCircle2 class="h-3 w-3" />
          <span
            >Última: {dayjs(schedule.lastExecutionAt).format(
              "DD MMM, HH:mm",
            )}</span
          >
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Section (Mobile) / Side Section (Desktop): Actions & Switch -->
  <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
    <!-- Action Buttons -->
    <div class="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Ver historial"
        class="h-9 w-9 sm:h-8 sm:w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
        onclick={() => onHistory(schedule)}
      >
        <Activity class="h-4.5 w-4.5 sm:h-4 sm:w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Editar"
        class="h-9 w-9 sm:h-8 sm:w-8 text-slate-400 hover:text-[#a151fc] hover:bg-[#a151fc]/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
        onclick={() => onEdit(schedule)}
      >
        <Pencil class="h-4.5 w-4.5 sm:h-4 sm:w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Eliminar"
        class="h-9 w-9 sm:h-8 sm:w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
        onclick={() => onDelete(schedule.id)}
      >
        <Trash2 class="h-4.5 w-4.5 sm:h-4 sm:w-4" />
      </Button>
    </div>

    <!-- Switch (Checkbox) -->
    <button
      type="button"
      role="switch"
      aria-checked={schedule.isEnabled}
      aria-label="Activar o desactivar alarma"
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#a151fc] focus:ring-offset-2 {schedule.isEnabled
        ? 'bg-[#a151fc]'
        : 'bg-slate-200'} {schedule.status === 'executed'
        ? 'opacity-50 cursor-not-allowed'
        : ''}"
      onclick={() =>
        schedule.status !== "executed" &&
        onToggle(schedule.id, schedule.isEnabled)}
      disabled={schedule.status === "executed"}
    >
      <span
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {schedule.isEnabled
          ? 'translate-x-4'
          : 'translate-x-0'}"
      ></span>
    </button>
  </div>
</div>
