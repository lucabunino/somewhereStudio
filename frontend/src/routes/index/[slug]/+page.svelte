<script>
// Imports
import Serie from "$lib/components/Serie.svelte";
import Module from "$lib/components/Module.svelte";
// Data
let { data } = $props();
$inspect(data)
let extraOpen = $state(false)
</script>

<section id="singleProject">
  <div class="intro ronzino-12 medium uppercase">
    <h1 class="project-title gaisyr-34 normalcase">{data.project[0].title}</h1>
    {#if data.project[0].collaborations}
      <p class="collaborations">In collaborazione con {#each data.project[0].collaborations as collaboration, j}{collaboration.title}{#if data.project[0].collaborations?.length - 1 > j}{@html ', '}{/if}{/each}</p>
    {/if}
    {#if data.project[0].date || data.project[0].locations}
      <p class="date-and-location">
        {#if data.project[0].date}
          <span class="date">{new Date(data.project[0].date).getFullYear()}{#if data.project[0].locations}{@html ', '}{/if}</span>
        {/if}
        {#if data.project[0].locations}
          <span class="locations">{#each data.project[0].locations as location, j}{location.title}{#if data.project[0].locations?.length - 1 > j}{@html ', '}{/if}{/each}</span>
        {/if}
      </p>
    {/if}
    {#if data.project[0].tags}
      <ul class="tags">{#each data.project[0].tags as tag, j}<li>{tag.title}{#if data.project[0].tags?.length - 1 > j}{@html ', '}{/if}</li>{/each}</ul>
    {/if}
  </div>
  
  {#each data.project[0].modules as module, i (module._id)}
    {#if module.modules}
      <Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={true} link={false}/>
    {:else}
      <Module module={module} i={i} hiddenProject={true} link={false}/>
    {/if}
  {/each}
</section>
<section id="extra"
class:open={extraOpen}
onclick={() => {extraOpen ? '' : extraOpen = true}}
>
  <p class="ronzino-12 medium uppercase">Extra</p>
</section>
<div id="extraSwitch" class:open={extraOpen}
onclick={() => {extraOpen ? extraOpen = false : ''}}
></div>

<style>
#singleProject {
  width: 90vw;
}
.project-title {
  margin-bottom: var(--gutter);
}
.intro {
  height: calc(50vh + 1rem);
  padding: calc(var(--gutter)*1.4) var(--gutter);
}

.tags {
  margin-top: var(--gutter);
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
}
#extra {
  width: 50vw;
  transform: translateX(40vw);
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  overflow-y: scroll;
  background-color: var(--white);
  transition: var(--transition);
  z-index: 10;
  padding: calc(var(--gutter)*1.4) var(--gutter);
}
#extra:not(.open) {
  cursor: pointer;
}
#extra:not(.open):hover {
  transform: translateX(38vw);
}
#extra.open {
  transform: translateX(0);
}
#extraSwitch {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 50vw;
  transform: translateX(-50vw);
  cursor: pointer;
}
#extraSwitch.open {
  z-index: 10;
  transform: translateX(0);
}
</style>