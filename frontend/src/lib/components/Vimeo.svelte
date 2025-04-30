<script>
import { onMount } from "svelte";
import Media from "$lib/components/Media.svelte";
let {
  id,
  autoplay = false,
  loop = false,
  cover
} = $props()

let aspectRatio = $state(null)

onMount(async () => {
  const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`);
  const data = await response.json();
  const width = data.width;
  const height = data.height;
  aspectRatio = width / height;
});
</script>


{#if cover}
<div class="vimeo-container">
  <Media media={cover} width={100}/>
  {#if aspectRatio}
  <iframe
  src={`https://player.vimeo.com/video/${id}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`}
  width="100%"
  style="aspect-ratio: {aspectRatio};"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  ></iframe>
  {/if}
</div>
{/if}

<style>
.vimeo-container {
  position: relative;
  width: 100%;
}
iframe {
  position: absolute;
  top: 0;
}
</style>