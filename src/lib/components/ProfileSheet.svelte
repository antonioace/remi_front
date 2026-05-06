<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Avatar from "$lib/components/ui/avatar";
  import { authState } from "$lib/stores/auth.svelte";
  import { usersService } from "$lib/features/users/services/users.service";
  import { s3Service } from "$lib/features/s3/services/s3.service";
  import { toast } from "svelte-sonner";
  import { Loader2, Pencil } from "@lucide/svelte";
  import type { User } from "$lib/features/auth/types";

  let { open = $bindable(false) } = $props<{ open: boolean }>();

  let profileData = $state({
    name: "",
    username: "",
    profileImage: "",
  });

  let signedProfileImage = $state<string | null>(null);
  let isLoading = $state(false);
  let isUploadingImage = $state(false);

  $effect(() => {
    const imageKey = profileData.profileImage;
    if (imageKey) {
      s3Service.getSignedUrl(imageKey).then((res) => {
        if (res.success && res.data) {
          signedProfileImage = res.data.signedUrl;
        } else {
          signedProfileImage = imageKey;
        }
      });
    } else {
      signedProfileImage = null;
    }
  });

  $effect(() => {
    if (open && authState.user) {
      const user = authState.user as User;
      profileData = {
        name: user.name || "",
        username: user.username || "",
        profileImage: user.profileImage || "",
      };
    }
  });

  async function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const file = target.files[0];
    target.value = "";

    isUploadingImage = true;
    try {
      const res = await s3Service.uploadFile(file, { folder: "profiles" });
      if (res.success && res.data) {
        const newImageKey = res.data.key || res.data.url;
        profileData.profileImage = newImageKey;
        toast.success("Imagen subida correctamente");

        // Actualizar el perfil automáticamente
        const id = authState.user?.userId || authState.user?.id;
        if (id) {
          const updateResult = await usersService.update(id, {
            name: profileData.name,
            username: profileData.username,
            profileImage: newImageKey,
          });

          if (updateResult.success && updateResult.data) {
            authState.setUser({
              ...authState.user,
              ...updateResult.data,
            } as User);
            toast.success("Perfil actualizado automáticamente");
          }
        }
      } else {
        toast.error("Error al subir imagen: " + res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al procesar la imagen");
    } finally {
      isUploadingImage = false;
    }
  }

  async function handleSaveChanges() {
    const id = authState.user?.userId || authState.user?.id;
    if (!id) return;

    isLoading = true;
    try {
      const result = await usersService.update(id, {
        name: profileData.name,
        username: profileData.username,
        profileImage: profileData.profileImage,
      });

      if (result.success && result.data) {
        // Actualizar el estado global del usuario
        authState.setUser({
          ...authState.user,
          ...result.data,
        } as User);
        toast.success("Perfil actualizado");
        open = false;
      } else {
        toast.error("Error al actualizar: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al guardar cambios");
    } finally {
      isLoading = false;
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content side="right" class="w-full sm:max-w-[450px] flex flex-col ">
    <Sheet.Header>
      <Sheet.Title class="text-2xl font-bold">Editar Perfil</Sheet.Title>
      <Sheet.Description>
        Actualiza tus datos personales y nombre de usuario.
      </Sheet.Description>
    </Sheet.Header>

    <div
      class="mt-8 p-6 flex flex-col gap-8 flex-1 overflow-y-auto pr-2 relative"
    >
      <!-- Profile Image Section -->
      <div class="flex flex-col items-center gap-4">
        <Avatar.Root
          class="h-28 w-28 border-4 border-slate-50 shadow-sm relative group"
        >
          <Avatar.Image
            src={signedProfileImage ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${authState.user?.email}`}
            alt="Avatar"
          />
          <Avatar.Fallback class="text-3xl text-slate-500 bg-slate-100"
            >{authState.user?.email
              ?.substring(0, 2)
              .toUpperCase()}</Avatar.Fallback
          >
          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer"
          >
            {#if isUploadingImage}
              <Loader2 class="h-6 w-6 text-white animate-spin" />
            {:else}
              <div
                class="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/30"
              >
                <Pencil class="h-5 w-5 text-white" />
              </div>
            {/if}
            <input
              type="file"
              accept="image/*"
              onchange={handleImageUpload}
              disabled={isUploadingImage || isLoading}
              class="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </Avatar.Root>
      </div>

      <!-- Form Fields -->
      <div class="space-y-5">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="name"
            >Nombre</label
          >
          <Input
            id="name"
            placeholder="Tu nombre"
            bind:value={profileData.name}
            disabled={isLoading || isUploadingImage}
            class="h-11 rounded-xl"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="username"
            >Username</label
          >
          <Input
            id="username"
            placeholder="Tu nombre de usuario"
            bind:value={profileData.username}
            disabled={isLoading || isUploadingImage}
            class="h-11 rounded-xl"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="email"
            >Correo electrónico</label
          >
          <Input
            id="email"
            value={authState.user?.email}
            disabled
            class="h-11 rounded-xl bg-slate-50 text-slate-500"
          />
        </div>
      </div>
    </div>

    <div
      class="border h-15 border-t flex items-center absolute bottom-0 flex w-full items-center bg-white"
    >
      <Button
        variant="ghost"
        onclick={() => (open = false)}
        disabled={isLoading || isUploadingImage}
        class="text-[#000] px-6 h-full flex-[0.5] border border-r-4 border-slate-50 rounded-none"
        >Cancelar</Button
      >
      <Button
        onclick={handleSaveChanges}
        disabled={isLoading || isUploadingImage}
        class="text-[#a151fc] px-6 h-full flex-[0.5] rounded-none bg-[#a151fc]/5 hover:bg-[#a151fc]/10"
      >
        {#if isLoading}
          <Loader2 class="h-4 w-4 animate-spin mr-2" />
          Guardando...
        {:else}
          Guardar Cambios
        {/if}
      </Button>
    </div>
  </Sheet.Content>
</Sheet.Root>
