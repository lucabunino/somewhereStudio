<script>
import Serie from "$lib/components/Serie.svelte";
import Module from "$lib/components/Module.svelte";
import Media from "$lib/components/Media.svelte";
import { blur } from "svelte/transition";
import { onMount } from "svelte";
import { isDark } from "$lib/utils/color";

let { data } = $props();
let extraOpen = $state(false)

$inspect(data)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

onMount(() => {
	tagger.setMaxTags(0)
	setTimeout(() => {
		tagger.setTags(data.project[0].tags, { keepHierarchy: false, hierarchy: 99 });
	}, 2000);
	setTimeout(() => {
		tagger.setMaxTags(data.project[0].tags.length)
	}, 3000);
})
</script>

<section id="singleProject" class:extra={data.project[0].extra} style={data.project[0].color ? `background-color: ${data.project[0].color.hex}` : ""}>
	<!-- <div class="intro ronzino-12 medium uppercase">
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
	</div> -->
	<div class="module intro ronzino-12 medium uppercase"
	in:blur|global={{ duration: 500, delay: 1000 }}
	out:blur|global={{ duration: 500}}
	>
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
		<!-- {#if data.project[0].tags}
			<ul class="tags">{#each data.project[0].tags as tag, j}<li>{tag.title}{#if data.project[0].tags?.length - 1 > j}{@html ', '}{/if}</li>{/each}</ul>
		{/if} -->
	</div>
	{#each data.project[0].modules as module, i (module._id)}
		{#if module.modules}
			<Serie slides={module.modules} project={module.project} size={module.size} showProject={false} hiddenProject={true} link={false} color={data.project[0].color ? data.project[0].color : null}/>
		{:else}
			<Module module={module} i={i} hiddenProject={true} link={false} showProject={false} color={data.project[0].color ? data.project[0].color : null}/>
		{/if}
	{/each}
</section>
{#if data.project[0].extra}
	<section id="extra"
	class:open={extraOpen}
	onclick={() => {extraOpen ? '' : extraOpen = true}}
	>
		<h4 class="ronzino-12 medium uppercase">Extra</h4>
			<div class="extra-container">
				{#each data.project[0].extra as extra, i}
					{#if extra._type === "extraText"}
						<p>{extra.text}</p>
					{:else if extra._type === "image"}
						<Media media={extra} captionExtra={true}/>
					{/if}
				{/each}
			</div>
	</section>
	<div id="extraSwitch" class:open={extraOpen}
	onclick={() => {extraOpen ? extraOpen = false : ''}}
	></div>
{/if}

<style>
#singleProject {
	width: 100vw;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
}
#singleProject.extra {
	width: 90vw;
}
.project-title {
	margin-bottom: var(--gutter);
}
.module {
	display: block;
	background-color: var(--white);
}
.intro {
	padding: 3em;
	text-align: center;
	max-width: 80vw;
	min-width: 40vw;
	align-self: center;
	/* height: calc(50vh + 1rem); */
	/* padding: calc(var(--gutter)*1.4) var(--gutter); */
}
.tags {
	margin-top: var(--gutter);
	list-style: none;
	padding: 0;
	display: flex;
	flex-direction: column;
}
#extra {
	width: 30vw;
	transform: translateX(20vw);
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
	transform: translateX(18vw);
}
#extra.open {
	transform: translateX(0);
}
#extraSwitch {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 70vw;
	transform: translateX(-70vw);
	cursor: pointer;
}
#extraSwitch.open {
	z-index: 10;
	transform: translateX(0);
}
#extra h4 {
	margin-bottom: 10rem;
}
.extra-container {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}
</style>