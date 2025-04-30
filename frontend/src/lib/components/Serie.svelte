<script>
import Module from "$lib/components/Module.svelte";
import { register } from 'swiper/element/bundle';register();
let {
  slides,
  project,
  size,
  hiddenProject = false,
  link = true,
 } = $props()
</script>

<swiper-container
class="{size ? size : module.size}"
pagination={{
  clickable: true
}}
autoHeight={true}
>
{#each slides as module, i}
  <swiper-slide class="slide">
      <Module module={module} i={i} size={size ? size : module.size} hiddenProject={hiddenProject ? true : false}/>
  </swiper-slide>
{/each}
</swiper-container>
{#if project && !hiddenProject}
  <p class="project ronzino-12 medium uppercase">{project.title}</p>
{/if}
{#if hiddenProject}
  <div class="slider-bar {size ? size : module.size}"></div>
{/if}

<style>
/* Serie */
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
