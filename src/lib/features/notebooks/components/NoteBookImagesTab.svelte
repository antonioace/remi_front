<script lang="ts">
  import type { Notebook } from "../types";
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Upload, Trash2, Image as ImageIcon } from "@lucide/svelte";
  import EditableText from "$lib/components/EditableText.svelte";
  import { notebookService } from "../services/notebook.service";
  import { s3Service } from "$lib/features/s3/services/s3.service";
  import { toast } from "svelte-sonner";

  interface Props {
    notebook: Notebook;
  }
  let { notebook = $bindable() }: Props = $props();
  let isUploadingImage = $state(false);
  async function handleUpdateField(field: string, value: unknown) {
    const result = await notebookService.updateNotebook(notebook.id, {
      [field]: value,
    });
    if (result.success) {
      toast.success("Actualizado correctamente");
    } else {
      toast.error("Error al actualizar: " + result.error);
      throw new Error(result.error);
    }
  }

  async function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const file = target.files[0];
    target.value = "";

    isUploadingImage = true;
    try {
      const s3Res = await s3Service.uploadFile(file, { folder: "notebooks" });
      if (s3Res.success && s3Res.data) {
        const url = s3Res.data.url;
        const key = s3Res.data.key;
        if (!url && !key) {
          toast.error("El servidor no devolvió los datos de la imagen.");
          return;
        }

        const newImage = { id: crypto.randomUUID(), url, key, text: "" };
        const currentImages = notebook.content?.images || [];
        const newImages = [...currentImages, newImage];

        await handleUpdateField("content", {
          ...notebook.content,
          images: newImages,
        });
        if (!notebook.content) notebook.content = {};
        notebook.content.images = newImages;
      } else {
        toast.error("Error al subir a S3: " + s3Res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al subir la imagen");
    } finally {
      isUploadingImage = false;
    }
  }

  async function updateImageText(imgId: string, newText: string) {
    if (!notebook.content?.images) return;
    const newImages = notebook.content.images.map((img) =>
      img.id === imgId ? { ...img, text: newText } : img,
    );
    await handleUpdateField("content", {
      ...notebook.content,
      images: newImages,
    });
    notebook.content.images = newImages;
  }

  async function deleteImage(imgId: string) {
    if (!confirm("¿Eliminar imagen?")) return;
    if (!notebook.content?.images) return;
    const newImages = notebook.content.images.filter((img) => img.id !== imgId);
    await handleUpdateField("content", {
      ...notebook.content,
      images: newImages,
    });
    notebook.content.images = newImages;
  }
  import ImagePreview from "$lib/components/ImagePreview.svelte";
</script>

<div class="mb-6 flex items-center justify-end w-full">
  <div class="relative">
    <Button
      variant="outline"
      class="gap-2 text-[#a151fc] border-[#a151fc] hover:bg-[#a151fc]/5"
      disabled={isUploadingImage}
    >
      {#if isUploadingImage}
        <Loader2 class="h-4 w-4 animate-spin" />
      {:else}
        <Upload class="h-4 w-4" />
        Subir Imagen
      {/if}
    </Button>
    <input
      type="file"
      accept="image/*"
      onchange={handleImageUpload}
      class="absolute inset-0 opacity-0 cursor-pointer"
      disabled={isUploadingImage}
    />
  </div>
</div>

{#if !notebook.content?.images || notebook.content.images.length === 0}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="rounded-full bg-slate-50 p-4 mb-4">
      <ImageIcon class="h-8 w-8 text-slate-300" />
    </div>
    <p class="text-sm font-medium text-slate-400">Sin imágenes adjuntas</p>
    <p class="text-xs text-slate-300 mt-1">Sube una imagen para comenzar</p>
  </div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {#each notebook.content.images as img (img.id)}
      <div
        class="flex flex-col rounded-2xl border border-slate-100 overflow-hidden bg-white group"
      >
        <div class="relative aspect-video bg-slate-100">
          {#await s3Service.getSignedUrl(img.key || img.url)}
            <div
              class="flex w-full h-full items-center justify-center bg-slate-100"
            >
              <Loader2 class="h-6 w-6 animate-spin text-slate-300" />
            </div>
          {:then res}
            {#if res.success && res.data?.signedUrl}
              <ImagePreview src={res.data.signedUrl} alt="Notebook adjunto">
                <img
                  src={res.data.signedUrl}
                  alt="Notebook adjunto"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </ImagePreview>
            {:else}
              <div
                class="flex flex-col w-full h-full items-center justify-center bg-slate-50 text-xs text-slate-400 font-medium text-center px-4"
              >
                <p>No se pudo cargar</p>
              </div>
            {/if}
          {/await}
          <button
            onclick={() => deleteImage(img.id)}
            class="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-slate-100 z-10"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        <div class="p-4 border-t border-slate-50">
          <EditableText
            value={img.text || ""}
            isTextarea={false}
            placeholder="Añade una anotación a esta imagen..."
            onSave={(val) => updateImageText(img.id, val)}
          >
            <p
              class="text-sm text-slate-700 {img.text
                ? ''
                : 'italic text-slate-400'}"
            >
              {img.text || "Sin anotación. Haz doble clic para añadir una."}
            </p>
          </EditableText>
        </div>
      </div>
    {/each}
  </div>
{/if}
