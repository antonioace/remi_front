<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NoteBookView from "$lib/features/notebooks/components/NoteBookView.svelte";
  import { authState } from "$lib/stores/auth.svelte";
</script>

<div class="min-h-screen flex flex-col bg-[#f4f7fe]">
  <Header title="Remido" />

  <main class="flex-1 p-6 lg:p-10 space-y-6">
    <div class="flex flex-col">
      <h1 class="text-2xl font-bold tracking-tight text-[#5c5b63]">
        Hola, {authState.user?.email?.split("@")[0] || "Usuario"}
      </h1>
      <p class="text-sm text-[#c1c1c3]">¡Bienvenido de nuevo!</p>
    </div>
    
    <NoteBookView />
  </main>
</div>
