<script>
// Imports
import { slide } from "svelte/transition";
import Module from "$lib/components/Module.svelte";

// Variables
let { data } = $props()
$inspect(data)
let innerWidth = $state(0)
let innerHeight = $state(0)
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section class="modules">
  {#if data.searchParams.length > 0}
    <div class="module intro gaisyr-34"
    in:slide|global={{ axis: "y", duration: 500, delay: 500 }}
    out:slide|global={{ axis: "y", duration: 500 }}
    >{data.modules.length} Risultati per:
      {#each data.searchParams as searchParam, i}
        {#each data.tags.filter(tag => tag.slug.current === searchParam) as tag, j}{tag.title}{#if j < data.tags.filter(tag => tag.slug.current === searchParam).length - 1}{@html ', '}{/if}{/each}{#if data.searchParams.length - 1 > i}{@html ', '}{/if}
      {/each}
    </div>
  {/if}

  {#each data.modules as module, i (module._id)}
    {#if module.modules}
      <div class="slide">
        {#each module.modules as slide, j}
          <Module module={slide} i={j} size={module.size}/>
        {/each}
        {#if module.project}<p class="project ronzino-12 medium uppercase">{module.project.title}</p>{/if}
      </div>
    {:else}
      <Module module={module} i={i}/>
    {/if}
  {/each}
</section>

<style>
.modules {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
}
.module {
  display: block;
  background-color: var(--white);
}
.intro {
  padding: 3em;
  text-align: center;
  max-width: 80vw;
}
.slide {
  background-color: var(--white);
}
.project {
  padding: .5em;
  text-align: right;
}
</style>