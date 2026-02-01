<script lang="ts">
  import type { RecoveryPayload, ResetPasswordDto } from "../types";
  import Icono from "../../shared/Icono.svelte";
  import { authState } from "$lib/stores/auth.svelte";
  import { authService } from "../services/auth.service";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let step = $state(1);
  let isLoading = $state(false);

  // Step 1 Form
  let payload: RecoveryPayload = $state({
    email: "",
  });

  // Step 2 Form
  let resetData = $state({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function handleRequestSubmit(e: Event) {
    e.preventDefault();
    if (isLoading) return;
    isLoading = true;

    const result = await authService.recovery(payload);
    if (result.success) {
      toast.success(result.data?.message || "Enlace de recuperación enviado");
      step = 2;
    } else {
      toast.error(result.error || "Error al solicitar recuperación");
    }
    isLoading = false;
  }

  async function handleResetSubmit(e: Event) {
    e.preventDefault();
    if (isLoading) return;

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    isLoading = true;

    const dto: ResetPasswordDto = {
      code: resetData.token,
      newPassword: resetData.newPassword,
    };

    const result = await authService.resetPassword(dto);
    if (result.success) {
      toast.success(
        result.data?.message || "Contraseña restablecida correctamente",
      );
      await goto("/auth/login");
    } else {
      toast.error(result.error || "Error al restablecer contraseña");
    }
    isLoading = false;
  }
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="mx-auto h-20 w-20">
      <Icono width="100%" height="100%" fill="#4f46e5" />
    </div>

    {#if step === 1}
      <h2
        class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
      >
        Recupera tu contraseña
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ingresa tu correo electrónico y te enviaremos un código para restablecer
        tu contraseña.
      </p>
    {:else}
      <h2
        class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
      >
        Restablece tu contraseña
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ingresa el código que recibiste y tu nueva contraseña.
      </p>
    {/if}
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    {#if step === 1}
      <form class="space-y-6" onsubmit={handleRequestSubmit}>
        <div>
          <label
            for="email"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Correo electrónico</label
          >
          <div class="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              bind:value={payload.email}
              autocomplete="email"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : "Enviar código de recuperación"}
          </button>
        </div>
      </form>
    {:else}
      <form class="space-y-6" onsubmit={handleResetSubmit}>
        <div>
          <label
            for="token"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Código de verificación</label
          >
          <div class="mt-2">
            <input
              id="token"
              name="token"
              type="text"
              bind:value={resetData.token}
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            for="newPassword"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Nueva contraseña</label
          >
          <div class="mt-2">
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              bind:value={resetData.newPassword}
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Confirmar contraseña</label
          >
          <div class="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              bind:value={resetData.confirmPassword}
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            onclick={() => (step = 1)}
            class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Volver a solicitar código
          </button>
        </div>
      </form>
    {/if}

    <p class="mt-10 text-center text-sm text-gray-500">
      ¿Recuerdas tu contraseña?
      <a
        href="/auth/login"
        class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >Inicia sesión</a
      >
    </p>
  </div>
</div>
