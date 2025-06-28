<script>
import Serie from "$lib/components/Serie.svelte";
import Module from "$lib/components/Module.svelte";
import Media from "$lib/components/Media.svelte";
import { blur, slide } from "svelte/transition";
import { onMount } from "svelte";
import { isDark } from "$lib/utils/color";

let { data } = $props();
let extraOpen = $state(false)
let domLoaded = $state(false)
let innerWidth = $state()
let innerHeight = $state()
let singleProjectHeight = $state()

$inspect(data)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

// Extra
import { getExtra } from '$lib/stores/extra.svelte.js';
let extraer = getExtra()
if (data.project[0].extra) {
	extraer.setExtra(true)
}

$effect(() => {
	tagger.setMaxTags(0)
	setTimeout(() => {
		tagger.setTags(data.project[0].tags, { keepHierarchy: false, hierarchy: 99 });
	}, 500);
	setTimeout(() => {
		tagger.setMaxTags(data.project[0].tags.length)
	}, 500);
	domLoaded = true;
	return () => {
		extraer.setExtra(false)
	};
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

{#if domLoaded}
	<!-- <section id="singleProject" class:extra={data.project[0].extra}
	bind:clientHeight={singleProjectHeight}
	style={data.project[0].color ? `background-color: ${data.project[0].color.hex}; margin-bottom: ${(singleProjectHeight - singleProjectHeight*zoomer.scale)*-1}px; transform: scale(${zoomer.scale}); transform-origin: left top; width: ${innerWidth*zoomer.scale}px` : `margin-bottom: ${(singleProjectHeight - singleProjectHeight*zoomer.scale)*-1}px; transform: scale(${zoomer.scale}); transform-origin: left top; width: ${innerWidth/zoomer.scale}px`}
	> -->
	<section id="singleProject" class:extra={data.project[0].extra}
	bind:clientHeight={singleProjectHeight}
	style={data.project[0].color ? `background-color: ${data.project[0].color.hex}; margin-bottom: ${(singleProjectHeight - singleProjectHeight*zoomer.scale)*-1}px; transform: scale(${zoomer.scale}); transform-origin: center top;` : `margin-bottom: ${(singleProjectHeight - singleProjectHeight*zoomer.scale)*-1}px; transform: scale(${zoomer.scale}); transform-origin: center top;`}
	>
		<div class="module intro ronzino-12 medium uppercase"
		in:blur|global={{ duration: 200, delay: 500 }}
		out:blur|global={{ duration: 200}}
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
		</div>
		{#each data.project[0].modules as module, i (module._id)}
			<div class="module-container"
			in:blur|global={{ duration: 200, delay: 500 + 100*i }}
			out:blur|global={{ duration: 200}}>
				{#if module.modules}
					<Serie slides={module.modules} project={module.project} size={module.size} showProject={false} hiddenProject={true} link={false} color={data.project[0].color ? data.project[0].color : null}/>
				{:else}
					<Module module={module} i={i} hiddenProject={true} link={false} showProject={false} color={data.project[0].color ? data.project[0].color : null}/>
				{/if}
			</div>
		{/each}
	</section>
	{#if data.project[0].extra}
		<section id="extra"
		class:open={extraOpen}
		onclick={() => {extraOpen ? '' : extraOpen = true}}
		in:slide|global={{ axis: 'x', duration: 200, delay: 500 }}
		out:slide|global={{ axis: 'x', duration: 200}}
		>
			<h4 class="ronzino-12 medium uppercase">Extra</h4>
				<div class="extra-container">
					{#each data.project[0].extra as extra, i}
						{#if extra._type === "extraText"}
							<p class="gaisyr-19">{extra.text}</p>
						{:else if extra._type === "image"}
							<Media media={extra} captionExtra={false} cover={true}/>
						{/if}
					{/each}
				</div>
		</section>
		<div id="extraSwitch" class:open={extraOpen}
		onclick={() => {extraOpen ? extraOpen = false : ''}}
		></div>
	{/if}
{/if}

<style>
#singleProject {
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	transition: var(--transition);
	transition-property: margin, transform;
}
#singleProject.extra {
	width: 96vw;
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
	width: 20vw;
	transform: translateX(16vw);
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
	transform: translateX(14vw);
}
#extra.open {
	transform: translateX(0);
}
#extraSwitch {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 80vw;
	transform: translateX(-80vw);
	cursor: pointer;
}
#extraSwitch.open {
	z-index: 10;
	transform: translateX(0);
}
#extra h4 {
	margin-bottom: 6rem;
}
.extra-container {
	display: flex;
	flex-direction: column;
	gap: 3rem;
}
</style>