<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import NoteBookView from "$lib/features/notebooks/components/NoteBookView.svelte";
</script>

<div class="flex flex-col bg-[#FFF] overflow-hidden grow">
  <Header title="Remido" />

  <div class="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto flex flex-col">
    <NoteBookView />
  </div>
</div>
