<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let {
    text = "",
    lines = 2,
    html = false,
    class: className = "",
    children,
    style = "",
    side = "top",
    align = "center",
  } = $props<{
    text?: string;
    lines?: number;
    html?: boolean;
    class?: string;
    children?: Snippet;
    style?: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  }>();

  let isTruncated = $state(false);
  let textContainerRef = $state<HTMLDivElement | null>(null);

  function checkIfTruncated() {
    if (textContainerRef) {
      isTruncated =
        textContainerRef.scrollHeight > textContainerRef.clientHeight;
    }
  }

  $effect(() => {
    if (textContainerRef) {
      setTimeout(checkIfTruncated, 0);
    }
  });

  onMount(() => {
    checkIfTruncated();
    const handleResize = () => {
      checkIfTruncated();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  let truncateStyle = $derived(`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    hyphens: auto;
    ${style}
  `);
</script>

{#snippet contentSnippet(props = {})}
  {#if html && text}
    <div
      bind:this={textContainerRef}
      class={className}
      style={truncateStyle}
      {...props}
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html text}
    </div>
  {:else}
    <div
      bind:this={textContainerRef}
      class={className}
      style={truncateStyle}
      {...props}
    >
      {#if text}
        {text}
      {:else if children}
        {@render children()}
      {/if}
    </div>
  {/if}
{/snippet}

{#if isTruncated}
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          {@render contentSnippet(props)}
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content
        {side}
        {align}
        sideOffset={4}
        arrowClasses="hidden"
        class="max-h-[300px] flex flex-col overflow-auto bg-white text-black border border-[#e0e0e0] rounded-[8px] p-2 text-xs font-normal text-left max-w-[300px] z-[9999]"
      >
        {#if html && text}
          <div class={className} {style}>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html text}
          </div>
        {:else}
          <div class={className} {style}>
            {#if text}
              {text}
            {:else if children}
              {@render children()}
            {/if}
          </div>
        {/if}
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{:else}
  {@render contentSnippet()}
{/if}
