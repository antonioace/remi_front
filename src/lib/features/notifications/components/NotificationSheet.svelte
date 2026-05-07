<script lang="ts">
  import { onMount } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Bell, Loader2, Inbox } from "@lucide/svelte";
  import { notificationService } from "$lib/features/notifications/services/notification.service";
  import type { Notification } from "$lib/features/notifications/types";
  import NotificationItem from "./NotificationItem.svelte";
  import { toast } from "svelte-sonner";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";

  let notifications = $state<Notification[]>([]);
  let isLoading = $state(false);
  let unreadCount = $derived(notifications.filter((n) => !n.readAt).length);

  const width = useWindowSize();
  let classWithWidth = $derived($width < 640 ? "w-full" : "w-[400px]");

  async function loadNotifications() {
    isLoading = true;
    const result = await notificationService.getAll({ limit: 10 });
    if (result.success && result.data) {
      notifications = result.data.data;
    }
    isLoading = false;
  }

  async function markAsRead(id: string) {
    const result = await notificationService.markAsRead(id);
    if (result.success) {
      notifications = notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      );
      toast.success("Marcada como leída");
    } else {
      toast.error("Error al marcar como leída");
    }
  }

  async function deleteNotification(id: string) {
    const result = await notificationService.remove(id);
    if (result.success) {
      notifications = notifications.filter((n) => n.id !== id);
      toast.success("Notificación eliminada");
    } else {
      toast.error("Error al eliminar la notificación");
    }
  }

  onMount(loadNotifications);
</script>

<Sheet.Root>
  <Sheet.Trigger>
    <Button
      variant="ghost"
      size="icon"
      class="relative h-10 bg-white w-10 rounded-xl text-slate-500 hover:text-[#a151fc] hover:bg-[#a151fc]/10"
      onclick={loadNotifications}
    >
      <Bell class="h-5 w-5" />
      {#if unreadCount > 0}
        <span
          class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"
        ></span>
      {/if}
    </Button>
  </Sheet.Trigger>
  <Sheet.Content
    side="right"
    class="{classWithWidth} p-4 flex flex-col flex-1"
  >
    <Sheet.Header class="border-b border-slate-100 pb-6 -mx-4 px-4">
      <Sheet.Title class="flex items-center gap-2">
        Notificaciones
        {#if unreadCount > 0}
          <span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full"
            >{unreadCount} nuevas</span
          >
        {/if}
      </Sheet.Title>
      <Sheet.Description>
        Tus actualizaciones y recordatorios recientes.
      </Sheet.Description>
    </Sheet.Header>

    <div class="mt-2 flex flex-col gap-0 flex-1 overflow-auto -mx-4">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 class="h-8 w-8 animate-spin mb-4 text-[#a151fc]" />
          <p>Cargando notificaciones...</p>
        </div>
      {:else if notifications.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox class="h-12 w-12 mb-4 opacity-50" />
          <p>No tienes notificaciones</p>
        </div>
      {:else}
        {#each notifications as notification (notification.id)}
          <NotificationItem
            {notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        {/each}
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>
