<script lang="ts">
  import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    RefreshCcw as ResetIcon,
    X,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { onMount, type Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";

  interface Props {
    src: string;
    alt?: string;
    children: Snippet;
  }

  let { src, alt = "Preview", children }: Props = $props();

  let isOpen = $state(false);
  let scale = $state(1);
  let rotate = $state(0);
  let flipX = $state(1);
  let flipY = $state(1);
  let position = $state({ x: 0, y: 0 });
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0 });

  function open() {
    isOpen = true;
  }

  function close() {
    isOpen = false;
    resetTransform();
  }

  function resetTransform() {
    scale = 1;
    rotate = 0;
    flipX = 1;
    flipY = 1;
    position = { x: 0, y: 0 };
  }

  function handleZoom(delta: number) {
    scale = Math.min(Math.max(scale + delta, 0.1), 5);
  }

  function handleRotate(dir: "cw" | "ccw") {
    rotate = dir === "cw" ? rotate + 90 : rotate - 90;
  }

  function handleFlip(axis: "x" | "y") {
    if (axis === "x") flipX = flipX === 1 ? -1 : 1;
    else flipY = flipY === 1 ? -1 : 1;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    handleZoom(delta);
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    isDragging = true;
    dragStart = { x: e.clientX - position.x, y: e.clientY - position.y };
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    position = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
  }

  function onMouseUp() {
    isDragging = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "Escape") close();
    if (e.key === "+" || e.key === "=") handleZoom(0.2);
    if (e.key === "-" || e.key === "_") handleZoom(-0.2);
    if (e.key === "r") handleRotate("cw");
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<!-- Trigger -->
<button
  onclick={open}
  class="w-full h-full block text-left bg-transparent border-none p-0 cursor-zoom-in"
>
  {@render children()}
</button>

<!-- Fullscreen Overlay -->
{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
    transition:fade={{ duration: 200 }}
  >
    <!-- Backdrop -->
    <button
      class="absolute inset-0 bg-black/90 border-none p-0 cursor-default"
      onclick={close}
      aria-label="Cerrar previsualización"
    ></button>

    <!-- Close Button -->
    <button
      onclick={close}
      class="absolute top-6 right-6 z-[10000] p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
      aria-label="Cerrar"
    >
      <X class="h-7 w-7" />
    </button>

    <!-- Viewport -->
    <div
      class="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move z-[1]"
      onwheel={handleWheel}
      onmousedown={onMouseDown}
      onmousemove={onMouseMove}
      onmouseup={onMouseUp}
      onmouseleave={onMouseUp}
    >
      <div
        class="flex items-center justify-center"
        style:transform="translate({position.x}px, {position.y}px)"
        style:transition={isDragging ? "none" : "transform 0.2s ease-out"}
      >
        <img
          {src}
          {alt}
          class="max-h-[90vh] max-w-[90vw] object-contain select-none"
          draggable="false"
          style:transform="scale({scale}) rotate({rotate}deg) scaleX({flipX}) scaleY({flipY})"
          style:transition="transform 0.15s ease-out"
        />
      </div>
    </div>

    <!-- Floating Toolbar -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-[10000]"
      transition:fly={{ y: 30, duration: 300 }}
    >
      <Button
        variant="ghost"
        size="icon"
        title="Zoom In"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleZoom(0.2)}
      >
        <ZoomIn class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Zoom Out"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleZoom(-0.2)}
      >
        <ZoomOut class="h-4 w-4" />
      </Button>

      <div class="w-[1px] h-4 bg-white/10 mx-1"></div>

      <Button
        variant="ghost"
        size="icon"
        title="Rotar izquierda"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleRotate("ccw")}
      >
        <RotateCcw class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Rotar derecha"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleRotate("cw")}
      >
        <RotateCw class="h-4 w-4" />
      </Button>

      <div class="w-[1px] h-4 bg-white/10 mx-1"></div>

      <Button
        variant="ghost"
        size="icon"
        title="Voltear horizontal"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleFlip("x")}
      >
        <FlipHorizontal class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Voltear vertical"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={() => handleFlip("y")}
      >
        <FlipVertical class="h-4 w-4" />
      </Button>

      <div class="w-[1px] h-4 bg-white/10 mx-1"></div>

      <Button
        variant="ghost"
        size="icon"
        title="Restablecer"
        class="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        onclick={resetTransform}
      >
        <ResetIcon class="h-4 w-4" />
      </Button>
    </div>
  </div>
{/if}
