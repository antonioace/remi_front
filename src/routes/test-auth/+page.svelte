<script>
  import Login from "$lib/features/auth/components/Login.svelte";
  import Register from "$lib/features/auth/components/Register.svelte";
  import RecoveryPassword from "$lib/features/auth/components/RecoveryPassword.svelte";
</script>

<div class="p-10 space-y-10">
  <div class="border p-5 rounded">
    <h1 class="text-xl font-bold mb-5">Componente de Inicio de Sesión</h1>
    <Login />
  </div>

  <div class="border p-5 rounded">
    <h1 class="text-xl font-bold mb-5">Componente de Registro</h1>
    <Register />
  </div>

  <div class="border p-5 rounded">
    <h1 class="text-xl font-bold mb-5">Componente de Recuperación</h1>
    <RecoveryPassword />
  </div>
</div>
