<script lang="ts">
  import { onMount } from "svelte";
  import { authState } from "$lib/stores/auth.svelte";
  import {
    Bell,
    Check,
    Trash2,
    Loader2,
    Inbox,
    Search,
    Plus,
    User,
    LogOut,
    Settings,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import { notificationService } from "$lib/features/notifications/services/notification.service";
  import type { Notification } from "$lib/features/notifications/types";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "dayjs/locale/es";
  import { toast } from "svelte-sonner";
  import { useWindowSize } from "$lib/features/shared/hooks/useWindowSize";
  import Icono from "$lib/features/shared/Icono.svelte";

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

<header class="flex h-20 items-center justify-between px-8 shrink-0 gap-4 bg-white border-b border-gray-100">
  <div class="flex items-center gap-2">
    <div class="h-8 w-8 text-[#a151fc]">
      <Icono width="100%" height="100%" fill="#a151fc" />
    </div>
    <h1 class="text-2xl font-bold tracking-tight text-[#1b254b]">{title}</h1>
  </div>

  <div class="flex items-center gap-3">
    <!-- Notification Panel -->
    <Sheet.Root>
      <Sheet.Trigger>
        <Button
          variant="ghost"
          size="icon"
          class="relative h-10 bg-white  w-10 rounded-xl text-slate-500 hover:text-[#a151fc] hover:bg-[#a151fc]/10"
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
              <Loader2 class="h-8 w-8 animate-spin mb-4 text-[#a151fc]" />
              <p>Cargando notificaciones...</p>
            </div>
          {:else if notifications.length === 0}
            <div
              class="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <Inbox class="h-12 w-12 mb-4 opacity-50" />
              <p>No tienes notificaciones</p>
            </div>
          {:else}
            {#each notifications as notification (notification.id)}
              <div
                class="flex gap-4 p-4 rounded-xl transition-colors hover:bg-slate-50 border border-transparent hover:border-slate-100 group relative
                  {notification.readAt ? 'opacity-70' : 'bg-[#a151fc]/5'}"
              >
                {#if !notification.readAt}
                  <span
                    class="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#a151fc]"
                  ></span>
                {/if}

                <div
                  class="h-10 w-10 rounded-full bg-[#a151fc]/10 text-[#a151fc] flex items-center justify-center shrink-0"
                >
                  <Bell class="h-5 w-5" />
                </div>
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p class="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p class="text-xs text-muted-foreground pt-1">
                    {dayjs(notification.createdAt).fromNow()}
                  </p>

                  <div
                    class="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {#if !notification.readAt}
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-7 text-xs px-2 hover:text-[#a151fc]"
                        onclick={() => markAsRead(notification.id)}
                      >
                        <Check class="h-3 w-3 mr-1" />
                        Marcar leída
                      </Button>
                    {/if}
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onclick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 class="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <!-- User Profile Dropdown -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full h-10 w-10 border border-slate-200 hover:bg-slate-100"
        >
          <Avatar.Root class="h-9 w-9">
            <Avatar.Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed={authState
                .user?.email}"
              alt="Avatar"
            />
            <Avatar.Fallback class="bg-[#a151fc]/10 text-[#a151fc]">
              {authState.user?.email?.substring(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="w-56">
        <DropdownMenu.Label class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">
              {authState.user?.email?.split("@")[0]}
            </p>
            <p class="text-xs leading-none text-muted-foreground">
              {authState.user?.email}
            </p>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <User class="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <Settings class="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onclick={authState.logout}
          class="text-red-600 focus:text-red-600"
        >
          <LogOut class="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</header>
