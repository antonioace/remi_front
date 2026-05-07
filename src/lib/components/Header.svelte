<script lang="ts">
  import { authState } from "$lib/stores/auth.svelte";
  import { User, LogOut, ArrowLeft } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import Icono from "$lib/features/shared/Icono.svelte";
  import ProfileSheet from "./ProfileSheet.svelte";
  import NotificationSheet from "$lib/features/notifications/components/NotificationSheet.svelte";
  import { s3Service } from "$lib/features/s3/services/s3.service";

  let { title = "Dashboard", backUrl = "" } = $props();

  let isProfileSheetOpen = $state(false);
  let signedAvatarUrl = $state<string | null>(null);

  $effect(() => {
    const profileImage = authState.user?.profileImage;
    if (profileImage) {
      const cleanPath = profileImage.includes("amazonaws.com")
        ? profileImage.split(".com/")[1]
        : profileImage;

      s3Service.getSignedUrl(cleanPath).then((res) => {
        if (res.success && res.data) {
          signedAvatarUrl = res.data.signedUrl;
        } else {
          signedAvatarUrl = profileImage;
        }
      });
    } else {
      signedAvatarUrl = null;
    }
  });
</script>

<header
  class="flex h-20 items-center justify-between px-8 shrink-0 gap-4 bg-white border-b border-gray-100"
>
  <div class="flex items-center gap-3">
    {#if backUrl}
      <button
        onclick={() => goto(backUrl)}
        class="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-[#a151fc] hover:bg-[#a151fc]/10 transition-all"
        aria-label="Volver"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
    {/if}
    <div class="h-8 w-8 text-[#a151fc]">
      <Icono width="100%" height="100%" fill="#a151fc" />
    </div>
    <h1 class="text-2xl font-bold tracking-tight text-[#1b254b]">{title}</h1>
  </div>

  <div class="flex items-center gap-3">
    <!-- Notification Panel -->
    <NotificationSheet />

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
              src={signedAvatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${authState.user?.email}`}
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
          <DropdownMenu.Item onclick={() => (isProfileSheetOpen = true)}>
            <User class="mr-2 h-4 w-4" />
            <span>Perfil</span>
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

    <ProfileSheet bind:open={isProfileSheetOpen} />
  </div>
</header>
