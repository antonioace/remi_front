<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NoteBookView from "$lib/features/notebooks/components/NoteBookView.svelte";
</script>

<div class="min-h-screen flex flex-col bg-[#FFF]">
  <Header title="Remido" />

  <main class="flex-1 p-6 lg:p-10 space-y-6">
    <NoteBookView />
  </main>
</div>
