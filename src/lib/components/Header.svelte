<script lang="ts">
  import { onMount } from "svelte";
  import { authState } from "$lib/stores/auth.svelte";
  import { Bell, LogOut, Check, Trash2, Loader2, Inbox } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import { notificationService } from "$lib/features/notifications/services/notification.service";
  import type { Notification } from "$lib/features/notifications/types";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "dayjs/locale/es";
  import { toast } from "svelte-sonner";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";

  dayjs.extend(relativeTime);
  dayjs.locale("es");

  let { title = "Dashboard" } = $props();

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
    }
  }

  async function deleteNotification(id: string) {
    const result = await notificationService.remove(id);
    if (result.success) {
      notifications = notifications.filter((n) => n.id !== id);
      toast.success("Notificación eliminada");
    }
  }

  onMount(loadNotifications);
</script>

<header
  class="flex h-16 items-center justify-between border-b px-6 bg-white shrink-0"
>
  <h1 class="text-xl font-bold">{title}</h1>

  <div class="flex items-center gap-4">
    <!-- Notification Panel -->
    <Sheet.Root>
      <Sheet.Trigger>
        <Button
          variant="ghost"
          size="icon"
          class="relative"
          onclick={loadNotifications}
        >
          <Bell class="h-5 w-5" />
          {#if unreadCount > 0}
            <span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600"
            ></span>
          {/if}
        </Button>
      </Sheet.Trigger>
      <Sheet.Content
        side="right"
        class={classWithWidth + " p-4 flex flex-col flex-1"}
      >
        <Sheet.Header>
          <Sheet.Title class="flex items-center gap-2">
            Notificaciones
            {#if unreadCount > 0}
              <span
                class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full"
                >{unreadCount} nuevas</span
              >
            {/if}
          </Sheet.Title>
          <Sheet.Description>
            Tus actualizaciones y recordatorios recientes.
          </Sheet.Description>
        </Sheet.Header>

        <div class="mt-8 flex flex-col gap-4 flex-1 overflow-auto">
          {#if isLoading}
            <div
              class="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <Loader2 class="h-8 w-8 animate-spin mb-2" />
              <p class="text-sm">Cargando...</p>
            </div>
          {:else if notifications.length === 0}
            <div
              class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg"
            >
              <Inbox class="h-8 w-8 mb-2" />
              <p class="text-sm font-medium">No tienes notificaciones</p>
            </div>
          {:else}
            <div class="divide-y border rounded-lg flex flex-col overflow-auto">
              {#each notifications as notification (notification.id)}
                <div
                  class="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors {!notification.readAt
                    ? 'bg-blue-50/30'
                    : ''}"
                >
                  <div class="flex justify-between items-start">
                    <h4
                      class="text-sm font-semibold {notification.readAt
                        ? 'text-slate-700'
                        : 'text-blue-900'}"
                    >
                      {notification.title}
                    </h4>
                    <span class="text-[10px] text-muted-foreground">
                      {dayjs(notification.createdAt).fromNow()}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <div class="flex justify-end gap-2 mt-1">
                    {#if !notification.readAt}
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 text-green-600"
                        onclick={() => markAsRead(notification.id)}
                        title="Marcar como leída"
                      >
                        <Check class="h-4 w-4" />
                      </Button>
                    {/if}
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-red-500"
                      onclick={() => deleteNotification(notification.id)}
                      title="Eliminar"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <!-- Logout Button -->
    <Button
      variant="destructive"
      size="sm"
      onclick={authState.logout}
      class="flex items-center gap-2"
    >
      <LogOut class="h-4 w-4" />
      <span>Cerrar Sesión</span>
    </Button>
  </div>
</header>
