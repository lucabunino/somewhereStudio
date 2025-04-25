<script>
import { blur, fade, fly } from "svelte/transition";
import { isDark } from "$lib/utils/color";
import Media from "$lib/components/Media.svelte";
import Vimeo from "$lib/components/Vimeo.svelte";
import Quotes from "$lib/components/Quotes.svelte";
import ImageSequence from "./imageSequence.svelte";
import { flip } from "svelte/animate";
let {
  module,
  i,
  size,
  hiddenProject = false,
  link = true,
} = $props()
</script>

{#if link}
<a class="module {size ? size : module.size}" data-kind={module.kind}
href={module.project?.slug ? `/index/${module.project.slug.current}` : ``}
in:blur|global={{ duration: 500, delay: 1000 + i*50 }}
out:blur|global={{ duration: 500 }}
>
  {#if ['image', 'shortVideo'].includes(module.kind)}
      <Media media={module.media[0]} />
  {:else if ['socialMedia'].includes(module.kind)}
    <div class="media-container" style="grid-template-columns: repeat({module.media.length}, 1fr)">
      {#each module.media as media, i}
        <Media media={media} />
      {/each}
    </div>
  {:else if ['imageSequence'].includes(module.kind)}
    <ImageSequence slides= {module.media} />
  {:else if ['vimeo'].includes(module.kind)}
    <div class="media-container">
      <Vimeo id={module.id} cover={module.cover}/>
    </div>
  {:else if ['box'].includes(module.kind)}
    <div class="media-container" style="background-color: {module.color.hex}; color: {isDark(module.color.hex) ? "var(--white)" : ""}">
      <div class="text">
        <div>
          <h3 class="ronzino-24">{module.title}</h3>
          {#if module.text1}
            <p>{module.text1}</p>
          {/if}
        </div>
        {#if module.project?.slug}
          <p class="project ronzino-12 medium uppercase">{module.project.title}</p>
        {/if}
      </div>
      <div class="img">
        <Media media={module.media[0]}/>
      </div>
    </div>
  {:else if ['shortText'].includes(module.kind)}
    <p class="text gaisyr-34">{module.text1}</p>
  {:else if ['longText'].includes(module.kind)}
    <div class="text">
        <h4 class="gaisyr-34">{module.text1}</h4>
        {#if module.text2}<p>{module.text2}</p>{/if}
    </div>
  {:else if ['quote'].includes(module.kind)}
    <Quotes slides={module.quotes} hiddenProject={hiddenProject ? true : false}/>
  {:else}
    <p class="gaisyr-34 todo">No style for {module.kind}</p>
  {/if}
  {#if !hiddenProject}
    {#if !['box'].includes(module.kind)}
      <div class="project ronzino-12 medium uppercase">{#if module.project?.slug}{module.project.title}{:else}<span style="color: red;">No linked project</span>{/if}</div>
    {/if}
  {/if}
</a>
{:else}
<div class="module {size ? size : module.size}" data-kind={module.kind}
in:blur|global={{ duration: 500, delay: 1000 + i*50 }}
out:blur|global={{ duration: 500 }}
>
  {#if ['image', 'shortVideo'].includes(module.kind)}
      <Media media={module.media[0]} />
  {:else if ['socialMedia'].includes(module.kind)}
    <div class="media-container" style="grid-template-columns: repeat({module.media.length}, 1fr)">
      {#each module.media as media, i}
        <Media media={media} />
      {/each}
    </div>
  {:else if ['imageSequence'].includes(module.kind)}
    <ImageSequence slides= {module.media} />
  {:else if ['vimeo'].includes(module.kind)}
    <div class="media-container">
      <Vimeo id={module.id} cover={module.cover}/>
    </div>
  {:else if ['box'].includes(module.kind)}
    <div class="media-container" style="background-color: {module.color.hex}; color: {isDark(module.color.hex) ? "var(--white)" : ""}">
      <div class="text">
        <div>
          <h3 class="ronzino-24">{module.title}</h3>
          {#if module.text1}
            <p>{module.text1}</p>
          {/if}
        </div>
        {#if module.project?.slug}
          <p class="project ronzino-12 medium uppercase">{module.project.title}</p>
        {/if}
      </div>
      <div class="img">
        <Media media={module.media[0]}/>
      </div>
    </div>
  {:else if ['shortText'].includes(module.kind)}
    <p class="text gaisyr-34">{module.text1}</p>
  {:else if ['longText'].includes(module.kind)}
    <div class="text">
        <h4 class="gaisyr-34">{module.text1}</h4>
        {#if module.text2}<p>{module.text2}</p>{/if}
    </div>
  {:else if ['quote'].includes(module.kind)}
    <Quotes slides={module.quotes} hiddenProject={hiddenProject ? true : false}/>
  {:else}
    <p class="gaisyr-34 todo">No style for {module.kind}</p>
  {/if}
  {#if !hiddenProject}
    {#if !['box'].includes(module.kind)}
      <div class="project ronzino-12 medium uppercase">{#if module.project?.slug}{module.project.title}{:else}<span style="color: red;">No linked project</span>{/if}</div>
    {/if}
  {/if}
</div>
{/if}

<style>
.module {
  display: block;
  background-color: var(--white);
}
.project {
  padding: .5em;
  text-align: right;
}
/* SocialMedia */
[data-kind="socialMedia"] .media-container {
  display: grid;
  gap: 1px;
}
/* Vimeo */
[data-kind="vimeo"] .media-container {
  display: flex;
}
/* ShortText */
[data-kind="shortText"] p:first-of-type {
  padding: var(--gutter) calc(var(--gutter)/2) calc(var(--gutter)*2);
  margin-left: 8em;
  text-indent: -8em;
}
/* Box */
[data-kind="box"] .media-container {
  display: flex;
}
[data-kind="box"] .text {
  padding: var(--gutter) calc(var(--gutter)/2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50%;
}
[data-kind="box"] h3 {
  margin-bottom: 1em;
}
[data-kind="box"] .text p:not(.project) {
  margin-bottom: 1em;
}
[data-kind="box"] .project {
  padding: 0;
}
[data-kind="box"] .box-img {
  width: 50%;
}
/* LongText */
[data-kind="longText"] .text {
  position: relative;
  vertical-align: baseline;
  padding: var(--gutter) calc(var(--gutter)/2);
}
[data-kind="longText"] h4 {
  float: right;
  width: 50%;
  shape-outside: margin-box;
  margin-left: var(--gutter);
}
[data-kind="longText"] p {
  clear: inline-start;
  margin-top: calc(2.428rem*.970*3 - 1.143em)
}
</style>