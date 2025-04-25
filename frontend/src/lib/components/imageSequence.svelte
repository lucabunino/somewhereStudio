<script>
import { register } from 'swiper/element/bundle';register();
import Media from '$lib/components/Media.svelte';register();
let { slides } = $props()
</script>

<swiper-container
pagination={{
  clickable: true
}}
>
{#each slides as image, i}
  <swiper-slide>
    <Media media={image} i={i} />
  </swiper-slide>
{/each}
</swiper-container>

<style>
/* imageSequence */
swiper-container::part(container) {
  overflow-x: clip;
  overflow-y: visible;
}
swiper-container::part(pagination) {
  font-size: .857rem;
  text-align: left;
  padding: .5em;
  width: -webkit-fill-available;
  bottom: -2.166em;
}
swiper-container::part(bullet), swiper-container::part(bullet-active) {
  width: .8em;
  height: .8em;
  background-color: var(--darkGray);
}
</style>
