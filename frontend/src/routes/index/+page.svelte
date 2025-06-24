<script>
// Imports
import Media from "$lib/components/Media.svelte";
import { onMount } from "svelte";
import { blur } from "svelte/transition";

// Variables
let { data } = $props()
$inspect(data)
let indexHover = $state(0)
let projectHover = $derived(data.index[indexHover])
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
onMount(() => {
	tagger.setMaxTags(0)
})

$effect(() => {
	domLoaded = true
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section id="index" class="gaisyr-34">
	{#key projectHover}
		<div class="cover"
		in:blur|global={{ duration: 200}}
		out:blur|global={{ duration: 200, delay: 500}}
		>
			<Media media={projectHover.cover} cover={true} width={2560}/>
		</div>
	{/key}
	<ul class="index gaisyr-14">
		<div class="labels ronzino-12 medium uppercase">
			<label>Anno</label>
			<label>Progetto</label>
			<label>Cliente/i</label>
			<label>In collaborazione con</label>
			<label>Format</label>
			<label>Argomento/i</label>
			<label>Location</label>
		</div>
		{#each data.index as project, i}
			<li class="project" class:singlePage={project.singlePage} class:active={indexHover === i}
			onmouseenter={() => {indexHover = i; console.log(projectHover)}}
			>
				<a class="project-link" href={project.singlePage ? `/index/${project.slug.current}` : ``}>
					<p class="year">{new Date(project.date).getFullYear()}</p>
					<h2 class="title">{project.title}</h2>
					<p class="client">{#each project.clients as client, j}{client.title}{#if project.clients?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="collaborations">{#each project.collaborations as collaboration, j}{collaboration.title}{#if project.collaborations?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="formats">{#each project.formats as format, j}{format.title}{#if project.formats?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="tags">{#each project.tags as tag, j}{tag.title}{#if project.tags?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="locations">{#each project.locations as location, j}{location.title}{#if project.locations?.length - 1 > j}{@html ', '}{/if}{/each}</p>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
#index {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 100vw;
}
.cover {
	position: fixed;
	top: 0;
	height: calc(50vh + 1rem);
	width: 100%;
}
.index {
	margin-top: calc(50vh + 1rem);
	min-height: calc(50vh - 1rem - .857rem*1.166*3 - var(--gutter)*12.8);
	width: 100%;
	overflow-y: scroll;
	padding: var(--gutter) calc(var(--gutter)/2);
	display: flex;
	flex-direction: column;
}
.project {
	list-style: none;
	padding: 0;
	width: 100%;
	padding: calc(var(--gutter)/4) calc(var(--gutter)/2);
}
.project.singlePage, .project.singlePage > .project-link {
	cursor: pointer;
}
.project.singlePage.active {
	background-color: var(--white);
}
.project-link,
.labels {
	display: grid;
	grid-template-columns: 1fr 4fr 4fr 4fr 4fr 4fr 4fr;
	gap: var(--gutter);
	cursor: default;
	color: inherit;
	text-decoration: none;
}
.labels {
	padding: calc(var(--gutter)/4) calc(var(--gutter)/2);
	margin-bottom: 3em;
}
.project-link>*:nth-child(1),
.project-link>*:nth-child(2),
.project-link>*:nth-child(4),
.project-link>*:nth-child(6),
.labels>*:nth-child(1),
.labels>*:nth-child(2),
.labels>*:nth-child(4),
.labels>*:nth-child(6) {
	text-align: left;
}
.project-link>*:nth-child(3),
.project-link>*:nth-child(5),
.project-link>*:nth-child(7),
.labels>*:nth-child(3),
.labels>*:nth-child(5),
.labels>*:nth-child(7) {
	text-align: right;
}
.project-link>*,
.labels {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>