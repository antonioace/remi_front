<script lang="ts">
  import type { Notification } from "$lib/features/notifications/types";
  import { Check, Trash2, User, Bell, Clock } from "@lucide/svelte";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "dayjs/locale/es";

  dayjs.extend(relativeTime);
  dayjs.locale("es");

  let { 
    notification, 
    onMarkAsRead, 
    onDelete 
  } = $props<{
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
  }>();
</script>

<div class="flex gap-4 px-4 py-4 border-b border-slate-100 group relative transition-colors">
  {#if !notification.readAt}
    <span class="absolute top-5 right-2 h-2 w-2 rounded-full bg-[#a151fc]"></span>
  {/if}  <!-- Left icon indicator -->
  <div class="pt-0.5 shrink-0">
    <div class="h-8 w-8 rounded-full flex items-center justify-center bg-[#a151fc]/10 text-[#a151fc]">
      <Bell class="h-4 w-4" />
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 space-y-1 min-w-0">
    <div class="flex justify-between items-start gap-4">
      <div class="pr-6">
        <p class="text-[15px] font-semibold text-slate-800 leading-tight">
          {notification.title}
        </p>
      </div>
    </div>
    
    <p class="text-sm text-slate-600 leading-relaxed pr-8">
      {notification.message}
    </p>

    <div class="flex items-center justify-between pt-2 h-6">
      <div class="flex items-center gap-2.5 text-xs text-slate-400">
        <div class="flex items-center gap-1">
          <User class="h-3.5 w-3.5" />
          <span>Sistema</span>
        </div>
        <span class="text-slate-300">·</span>
        <div class="flex items-center gap-1">
          <Clock class="h-3.5 w-3.5" />
          <span class="capitalize">{dayjs(notification.createdAt).fromNow()}</span>
        </div>
      </div>

      <!-- Actions: Bottom right, icons only -->
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {#if !notification.readAt}
          <button
            class="p-1.5 text-[#a151fc] hover:bg-[#a151fc]/10 rounded-md transition-colors"
            onclick={() => onMarkAsRead(notification.id)}
            title="Marcar como leída"
          >
            <Check class="h-4 w-4" />
          </button>
        {/if}
        <button
          class="p-1.5 text-[#a151fc] hover:bg-[#a151fc]/10 rounded-md transition-colors"
          onclick={() => onDelete(notification.id)}
          title="Eliminar notificación"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</div>
