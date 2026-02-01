<script lang="ts">
  import type { LoginCredentials } from "../types";
  import Icono from "../../shared/Icono.svelte";
  import { authState } from "$lib/stores/auth.svelte";
  import { authService } from "../services/auth.service";
  import { decodeJwt } from "$lib/utils/jwt";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let credentials: LoginCredentials = $state({
    email: "",
    password: "",
  });
  let isLoading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (isLoading) return;

    isLoading = true;

    const result = await authService.login(credentials);

    if (result.success && result.data) {
      const data = result.data;

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const payload = decodeJwt(data.access_token);

        if (payload) {
          authState.setAuthenticated(true);
          authState.setUser({
            userId: payload.sub as string,
            email: payload.email as string,
            role: (payload.role as string) || "user",
          });
          toast.success("Bienvenido");
          await goto("/dashboard/home");
        } else {
          toast.error("Error al procesar el token");
        }
      } else {
        toast.error("No se recibió token de acceso");
      }
    } else {
      toast.error(result.error || "Error al iniciar sesión");
    }
    isLoading = false;
  }
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="mx-auto h-20 w-20">
      <Icono width="100%" height="100%" fill="#4f46e5" />
    </div>
    <h2
      class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
    >
      Inicia sesión en tu cuenta
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" onsubmit={handleSubmit}>
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
            bind:value={credentials.email}
            autocomplete="email"
            required
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label
            for="password"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Contraseña</label
          >
          <div class="text-sm">
            <a
              href="/auth/recovery-password"
              class="font-semibold text-indigo-600 hover:text-indigo-500"
              >¿Olvidaste tu contraseña?</a
            >
          </div>
        </div>
        <div class="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            bind:value={credentials.password}
            autocomplete="current-password"
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
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm text-gray-500">
      ¿No tienes una cuenta?
      <a
        href="/auth/register"
        class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >Regístrate gratis</a
      >
    </p>
  </div>
</div>
