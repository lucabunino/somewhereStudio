<script>
// Imports
import { blur } from "svelte/transition";
import { flip } from "svelte/animate";
import Module from "$lib/components/Module.svelte";
import Serie from "$lib/components/Serie.svelte";
import { onMount } from "svelte";

// Variables
let { data } = $props()
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
onMount(() => {
	tagger.setTags(data.tags)
	tagger.setMaxTags(tagger.firstMaxTags)
	if (data.searchParams.length > tagger.firstMaxTags) {
		tagger.setMaxTags(data.searchParams.length)
	}
})

// Lifecycle
$effect(() => {
	domLoaded = true
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section id="modules">
	{#key data.searchParams}
		{#if data.searchParams.length > 0}
			<div class="module intro gaisyr-34"
			in:blur|global={{ duration: 500, delay: 1000 }}
			out:blur|global={{ duration: 500}}
			>{data.modules.length} Risultati per:
				{#each data.searchParams as searchParam, i}
					{#each data.tags.filter(tag => tag.slug.current === searchParam) as tag, j}{tag.title}{/each}{#if data.searchParams.length - 1 > i}{@html ', '}{/if}
				{/each}
			</div>
		{/if}
		{#each data.modules as module, i (module._id)}
			{#if module.modules}
				<Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={true} link={false}/>
			{:else}
				<Module module={module} i={i}/>
			{/if}
		{/each}
	{/key}
</section>

<style>
#modules {
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