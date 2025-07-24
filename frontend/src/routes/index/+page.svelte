<script>
// Imports
import Media from "$lib/components/Media.svelte";
import { onMount } from "svelte";
import { blur } from "svelte/transition";

// Variables
let { data } = $props()
let indexHover = $state(0)
let projectHover = $derived(data.index[indexHover])
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let projects = $state([])
let projectHeights = $state([])
let activeProjects = $state([])

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
onMount(() => {
	tagger.setMaxTags(0)
})

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

$effect(() => {
	domLoaded = true
})

function handleScroll() {
	if (innerWidth > 1100) return;

	console.log("scroll");
	

	const videoHeight = innerWidth / 16 * 9;
	const elements = document.querySelectorAll(".project");
	const visible = [];

	for (let i = 0; i < elements.length; i++) {
		const rect = elements[i].getBoundingClientRect();
		if (rect.top + 1 > videoHeight) {
			visible.push(i);
		}
	}

	// Automatically set indexHover to the first visible project
	if (visible.length > 0) {
		indexHover = visible[0];
	}
}


</script>

<svelte:head>
	{#if data.seo.SEOTitle}<title>{data.seo.SEOTitle} — Index</title>{/if}
	{#if data.seo.SEOTitle}<meta property="og:title" content={`${data.seo.SEOTitle} — Index`}>{/if}
	{#if data.seo.SEOTitle}<meta property="og:site_name" content={`${data.seo.SEOTitle} — Index`}>{/if}
</svelte:head>
<svelte:window bind:innerWidth bind:innerHeight onscroll={handleScroll}></svelte:window>

<section id="index" class="gaisyr-34">
	{#key projectHover}
		<div class="cover"
		in:blur|global={{ duration: 200}}
		out:blur|global={{ duration: 200, delay: 500}}
		>
			<Media media={projectHover.cover} cover={true} width={2560}/>
		</div>
	{/key}
	<ul class="index gaisyr-14"
	style={`--projectHeight: ${projectHeights[data.index.length - 1]}px`}
	>
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
			onmouseenter={() => {indexHover = i; (project.locations?.[0]?.latitude && project.locations?.[0]?.longitude) ? coordinater.setCoordinates(project.locations[0].latitude, project.locations[0].longitude) : coordinater.setCoordinates(null, null)}}
			bind:this={projects[i]}
			bind:clientHeight={projectHeights[i]}
			>
				<a class="project-link" href={project.singlePage ? `/index/${project.slug.current}` : ``}>
					<p class="year">{new Date(project.date).getFullYear()}</p>
					<h2 class="title mobile-gaisyr-22">{project.title}</h2>
					<p class="client desktop-only">{#each project.clients as client, j}{client.title}{#if project.clients?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="collaborations">{#each project.collaborations as collaboration, j}{collaboration.title}{#if project.collaborations?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="formats">{#each project.formats as format, j}{format.title}{#if project.formats?.length - 1 > j}{@html ', '}{/if}{/each}<span class="mobile-inline">{#if project.clients}{@html ' per '}{#each project.clients as client, j}{client.title}{#if project.clients?.length - 1 > j}{@html ', '}{/if}{/each}{/if}</span></p>
					<p class="tags">{#each project.tags as tag, j}{tag.title}{#if project.tags?.length - 1 > j}{@html ', '}{/if}{/each}</p>
					<p class="locations">{#each project.locations as location, j}{location.title}{#if project.locations?.length - 1 > j}{@html ', '}{/if}{/each}</p>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
#index {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
	-webkit-box-align: start;
	    -ms-flex-align: start;
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
	padding: calc(var(--gutter)*5 + .857rem*1.166) calc(var(--gutter)/2) var(--gutter);
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
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
	display: -ms-grid;
	display: grid;
	-ms-grid-columns: 1fr var(--gutter) 4fr var(--gutter) 4fr var(--gutter) 4fr var(--gutter) 4fr var(--gutter) 4fr var(--gutter) 4fr;
	grid-template-columns: 1fr 4fr 4fr 4fr 4fr 4fr 4fr;
	gap: var(--gutter);
	cursor: default;
	color: inherit;
	text-decoration: none;
}
.labels {
	position: fixed;
	top: calc(50vh + 1rem);
	padding: var(--gutter) calc(var(--gutter)/2);
	background-color: var(--lightGray);
	width: calc(100% - var(--gutter));
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
	-o-text-overflow: ellipsis;
	   text-overflow: ellipsis;
}
@media screen and (max-width: 1100px) {
	.labels {
		display: none;
	}
	.index {
		margin-bottom: 0;
		padding: 0 0 calc(100vh - (50vh + 1rem) - var(--projectHeight) - var(--gutter)*21.4 - (var(--gutter)*2.8 + 2rem) - (.857rem*1.166*8 + var(--gutter)*3));
	}
	.project {
		padding: calc(var(--gutter)*2) var(--gutter);
		border-bottom: solid 1px var(--darkGray);
	}
	.project-link {
		-ms-grid-columns: 40px 0 1fr;
		grid-template-columns: 40px 1fr;
		gap: 0;
	}
	.project-link>* {
		-ms-grid-column: 1;
		-ms-grid-column-span: 2;
		grid-column: 1 / span 2;
	}
	.project-link>*:nth-child(1) {
		-ms-grid-column: 1;
		-ms-grid-column-span: 1;
		grid-column: 1 / span 1;
		-ms-grid-row: 1;
		grid-row: 1;
	}
	.project-link>*:nth-child(2) {
		-ms-grid-row: 2;
		grid-row: 2;
		margin: .7rem 0;
	}
	.project-link>*:nth-child(3) {
		-ms-grid-row: 4;
		grid-row: 4;
	}
	.project-link>*:nth-child(4) {
		-ms-grid-row: 5;
		grid-row: 5;
		-ms-grid-column: 2;
		-ms-grid-column-span: 1;
		grid-column: 2 / span 1;
		display: none;
	}
	.project-link>*:nth-child(5) {
		-ms-grid-row: 5;
		grid-row: 5;
		-ms-grid-column: 1;
		-ms-grid-column-span: 2;
		grid-column: 1 / span 2;
	}
	.project-link>*:nth-child(6) {
		-ms-grid-row: 3;
		grid-row: 3;
	}
	.project-link>*:nth-child(7) {
		-ms-grid-column: 2;
		-ms-grid-column-span: 1;
		grid-column: 2 / span 1;
		-ms-grid-row: 1;
		grid-row: 1;
	}
	.project-link>*:nth-child(3),
	.project-link>*:nth-child(5),
	.project-link>*:nth-child(7),
	.labels>*:nth-child(3),
	.labels>*:nth-child(5),
	.labels>*:nth-child(7) {
		text-align: left;
	}
}
@media screen and (max-width: 700px) {
	.cover {
		height: auto;
		aspect-ratio: 16/9;
	}
	.index {
		margin-top: calc(100vw / 16 * 9);
		padding: 0 0 calc(100vh - 100vw / 16 * 9 - var(--projectHeight) - var(--gutter)*21.4 - (var(--gutter)*2.8 + 2rem) - (.857rem*1.166*8 + var(--gutter)*3));
	}
}
</style>