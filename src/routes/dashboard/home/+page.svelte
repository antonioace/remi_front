<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NoteBookView from "$lib/features/notebooks/components/NoteBookView.svelte";
</script>

<div class="min-h-screen bg-slate-50 flex flex-col">
  <Header title="Dashboard" />

  <main class="flex-1 p-6 lg:p-10">
    <NoteBookView />
  </main>
</div>
