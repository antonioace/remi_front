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
  class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group"
>
  <div class="flex items-center gap-4">
    <div
      class="h-10 w-10 rounded-lg {schedule.isEnabled
        ? 'bg-[#a151fc]/10 text-[#a151fc]'
        : 'bg-slate-100 text-slate-400'} flex items-center justify-center transition-colors"
    >
      <Bell class="h-5 w-5" />
    </div>
    <div>
      <p
        class="font-bold {schedule.isEnabled
          ? 'text-slate-900'
          : 'text-slate-400'} transition-colors"
      >
        {schedule.name}
      </p>
      <div class="flex items-center gap-3 mt-1">
        <div
          class="flex items-center gap-1 text-[11px] text-slate-400 font-medium uppercase"
        >
          <Clock class="h-3 w-3" />
          <span>
            {#if schedule.type === "normal"}
              {dayjs(schedule.date).format("DD MMM, HH:mm")}
            {:else}
              Inicia {dayjs(schedule.startDate).format("DD MMM")}
            {/if}
          </span>
        </div>
        <Badge
          variant="outline"
          title={schedule.type === "normal" ? "Puntual" : "Recurrente"}
          class="px-1.5 h-5 bg-slate-50 border-slate-100 text-slate-500"
        >
          {#if schedule.type === "normal"}
            <Calendar class="h-3 w-3" />
          {:else}
            <Repeat class="h-3 w-3" />
          {/if}
        </Badge>
        <Badge
          title={schedule.status === "executed" ? "Ejecutado" : "Pendiente"}
          class="px-1.5 h-5 {schedule.status === 'executed'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-blue-100 text-blue-700 border-blue-200'}"
        >
          {#if schedule.status === "executed"}
            <CheckCircle2 class="h-3 w-3" />
          {:else}
            <Clock class="h-3 w-3" />
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
  <div class="flex items-center gap-4">
    <!-- Switch (Custom CSS) -->
    <button
      type="button"
      role="switch"
      aria-checked={schedule.isEnabled}
      aria-label="Alternar estado de la programación"
      class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#a151fc] focus:ring-offset-2 {schedule.isEnabled
        ? 'bg-[#a151fc]'
        : 'bg-slate-200'} {schedule.status === 'executed'
        ? 'opacity-50 cursor-not-allowed'
        : ''}"
      onclick={() =>
        schedule.status !== "executed" && onToggle(schedule.id, schedule.isEnabled)}
      disabled={schedule.status === "executed"}
    >
      <span
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {schedule.isEnabled
          ? 'translate-x-4'
          : 'translate-x-0'}"
      ></span>
    </button>

    <Button
      variant="ghost"
      size="icon"
      aria-label="Ver historial"
      class="h-8 w-8 text-slate-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
      onclick={() => onHistory(schedule)}
    >
      <Activity class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      aria-label="Editar programación"
      class="h-8 w-8 text-slate-300 hover:text-[#a151fc] hover:bg-[#a151fc]/10 opacity-0 group-hover:opacity-100 transition-all"
      onclick={() => onEdit(schedule)}
    >
      <Pencil class="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      aria-label="Eliminar programación"
      class="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
      onclick={() => onDelete(schedule.id)}
    >
      <Trash2 class="h-4 w-4" />
    </Button>
  </div>
</div>
