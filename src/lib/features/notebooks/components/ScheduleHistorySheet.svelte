<script lang="ts">
  import { Activity, Loader2 } from "@lucide/svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Badge } from "$lib/components/ui/badge";
  import dayjs from "dayjs";
  import { NotebookEventStatus, type NotebookEvent } from "../types";

  interface Props {
    open: boolean;
    events: NotebookEvent[];
    isLoading: boolean;
  }

  let { open = $bindable(), events, isLoading }: Props = $props();

  const statusMap = {
    [NotebookEventStatus.PENDING]: {
      label: "Pendiente",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    [NotebookEventStatus.EXECUTED]: {
      label: "Ejecutado",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    [NotebookEventStatus.FAILED]: {
      label: "Fallido",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    [NotebookEventStatus.CANCELED]: {
      label: "Cancelado",
      color: "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  const typeMap = {
    created: "Creación",
    updated: "Actualización",
    scheduled: "Programación",
  };
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="sm:max-w-[450px]">
    <Sheet.Header class="space-y-4 border-b border-slate-100 pb-6">
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-[#a151fc]/10 text-[#a151fc] flex items-center justify-center"
        >
          <Activity class="h-5 w-5" />
        </div>
        <div class="space-y-0.5">
          <Sheet.Title class="text-xl font-bold text-slate-900"
            >Historial de Ejecuciones</Sheet.Title
          >
          <Sheet.Description
            class="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap"
          >
            Eventos registrados
          </Sheet.Description>
        </div>
      </div>
    </Sheet.Header>

    <div class="mt-8 h-full pb-20 overflow-y-auto">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-blue-500 opacity-40" />
          <p class="mt-4 text-sm text-slate-500">Cargando historial...</p>
        </div>
      {:else if events.length === 0}
        <div
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            class="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3"
          >
            <Activity class="h-6 w-6 text-slate-300" />
          </div>
          <p class="text-sm text-slate-500 font-medium">Sin ejecuciones</p>
          <p class="text-xs text-slate-400 mt-1">
            Aún no se han registrado eventos para esta programación.
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each events as event (event.id)}
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div class="flex items-center justify-between mb-2">
                <Badge
                  class="text-[10px] uppercase font-bold px-1.5 h-5 {statusMap[
                    event.status
                  ].color}"
                >
                  {statusMap[event.status].label}
                </Badge>
                <span class="text-[10px] text-slate-400 font-medium"
                  >{dayjs(event.createdAt).format("DD/MM/YYYY HH:mm")}</span
                >
              </div>
              <div class="space-y-1">
                <p class="text-xs font-semibold text-slate-700">
                  {typeMap[event.type] || event.type}
                </p>
                {#if event.assignedAt}
                  <p class="text-[10px] text-slate-500">
                    Programado para: {dayjs(event.assignedAt).format(
                      "DD MMM, HH:mm",
                    )}
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>
