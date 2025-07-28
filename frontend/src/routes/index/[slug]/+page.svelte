<script>
import Serie from "$lib/components/Serie.svelte";
import Module from "$lib/components/Module.svelte";
import Media from "$lib/components/Media.svelte";
import { blur, slide } from "svelte/transition";
import { onDestroy, onMount } from "svelte";
import { isDark } from "$lib/utils/color";
import { urlFor } from "$lib/utils/image";

let { data } = $props();
let domLoaded = $state(false)
let innerWidth = $state()
let innerHeight = $state()
let singleProjectHeight = $state()
let introHeight = $state()
let body = $state()

// Bg
import { getBg } from '$lib/stores/bg.svelte.js';
let bger = getBg()

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

// Extra
import { getExtra } from '$lib/stores/extra.svelte.js';
let extraer = getExtra()

if (data.project[0]?.extra) {
	extraer.setExtra(true)
}

onMount(() => {
	bger.setBg(data.project[0].color ? data.project[0].color.hex : null)
	zoomer.setZoom(zoomer.initialZoom)
	tagger.setMaxTags(0)
	setTimeout(() => {
		tagger.setTags(data.project[0].tags, { keepHierarchy: false, hierarchy: 99 });
		tagger.setMaxTags(data.project[0].tags.length)
	}, 1500);
})
$effect(() => {
	domLoaded = true;
	if (extraer.extraOpen == true) {
		console.log("open");
		body.style.overflow = 'hidden';
	} else {
		console.log("close");
		body.style.overflow = '';
	}
})

onDestroy(() => {
	extraer.setExtra(false)
	extraer.setExtraOpen(false)
	body.style.overflow = '';
	bger.setBg(null)
})

function handleMouseEnter(latitude, longitude) {
	if (latitude && longitude) {
		coordinater.setCoordinates(latitude, longitude)
	} else {
		coordinater.setCoordinates(null, null)
	}
}
</script>

<svelte:head>
	{#if data.seo.SEOTitle}<title>{data.seo.SEOTitle} — {data.project[0].title}</title>{/if}
	{#if data.project[0].SEODescription}<meta name="description" content={data.project[0].SEODescription}>{/if}
	{#if !data.project[0].singlePage}
		<meta name="robots" content="index,follow">
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	{#if data.seo.SEOTitle}<meta property="og:title" content={`${data.seo.SEOTitle} — ${data.project[0].title}`}>{/if}
	{#if data.project[0].SEODescription}<meta property="og:description" content={data.project[0].SEODescription}>{/if}
	{#if data.project[0].cover}<meta property="og:image" content={urlFor(data.project[0].cover).width(2000).url()}>{/if}
	{#if data.seo.SEOTitle}<meta property="og:site_name" content={`${data.seo.SEOTitle} — ${data.project[0].title}`}>{/if}
</svelte:head>
<svelte:body bind:this={body}/>
<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

{#if domLoaded}
	<section id="singleProject" class:extra={data.project[0].extra}
	bind:clientHeight={singleProjectHeight}
	style={`margin-bottom: ${(singleProjectHeight - singleProjectHeight*zoomer.scale)*-1}px; -webkit-transform: scale(${zoomer.scale}); -ms-transform: scale(${zoomer.scale}); transform: scale(${zoomer.scale}); -webkit-transform-origin: center top; -ms-transform-origin: center top; transform-origin: center top;`}
	>
		<div class="module intro ronzino-12 medium uppercase"
		in:blur|global={{ duration: 200, delay: 500 }}
		out:blur|global={{ duration: 200}}
		bind:clientHeight={introHeight}
		>
			<h1 class="project-title gaisyr-34 mobile-gaisyr-30 normalcase">{data.project[0].title}</h1>
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
			<div class="module-container" role="group"
			in:blur|global={{ duration: 200, delay: 500 + 100*i }}
			out:blur|global={{ duration: 200}}
			data-kind={module.kind}
			onmouseenter={() => {handleMouseEnter(module.latitude, module.longitude)}}
			>
				{#if module.modules}
					<Serie slides={module.modules} position={module.position} project={module.project} size={module.size} showProject={false} hiddenProject={true} link={false} color={data.project[0].color ? data.project[0].color : null} key={i}/>
				{:else}
					<Module module={module} i={i} hiddenProject={true} link={false} showProject={false} color={data.project[0].color ? data.project[0].color : null}/>
				{/if}
			</div>
		{/each}
	</section>
	{#if data.project[0].extra}
		<section id="extra"
		role="button"
		tabindex="0"
		class:open={extraer.extraOpen}
		onclick={() => {!extraer.extraOpen && extraer.setExtraOpen(true)}}
		onkeydown={(e) => {if ((e.key === 'Enter' || e.key === ' ') && !extraer.extraOpen) {
			e.preventDefault();
			extraer.setExtraOpen(true);
		}}}
		in:slide|global={{ axis: 'x', duration: 200, delay: 500 }}
		out:slide|global={{ axis: 'x', duration: 200}}
		style={`--introHeight: ${0}px`}
		>
		
		<div class="module intro ronzino-12 medium uppercase mobile-only"
		in:blur|global={{ duration: 200, delay: 500 }}
		out:blur|global={{ duration: 200}}
		bind:clientHeight={introHeight}
		>
			<h1 class="project-title gaisyr-34 mobile-gaisyr-30 normalcase">{data.project[0].title}</h1>
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
		<div role="button" tabindex="0" id="extraSwitch" class:open={extraer.extraOpen}
		onclick={() => {extraer.extraOpen && extraer.setExtraOpen(false)}}
		onkeydown={(e) => {
			if ((e.key === 'Enter' || e.key === ' ') && !extraer.extraOpen) {
				e.preventDefault();
				extraer.setExtraOpen(true);
			}
		}}
		style={`--introHeight: ${introHeight}px`}
		></div>
	{/if}
{/if}

<style>
#singleProject {
	width: 100%;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
	-ms-flex-wrap: nowrap;
	    flex-wrap: nowrap;
	-webkit-transition: var(--transition);
	-o-transition: var(--transition);
	transition: var(--transition);
	-webkit-transition-property: margin, -webkit-transform;
	transition-property: margin, -webkit-transform;
	-o-transition-property: margin, transform;
	transition-property: margin, transform;
	transition-property: margin, transform, -webkit-transform;
}
#singleProject.extra {
	width: 96vw;
}
.project-title {
	margin-bottom: var(--gutter);
}
.module-container {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
}
.module {
	display: block;
	background-color: var(--white);
}
.intro {
	padding: 6rem 3rem 5rem;
	text-align: center;
	max-width: 80vw;
	min-width: 40vw;
	-ms-flex-item-align: center;
	    -ms-grid-row-align: center;
	    align-self: center;
}
#extra {
	width: 20vw;
	-webkit-transform: translateX(16vw);
	    -ms-transform: translateX(16vw);
	        transform: translateX(16vw);
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	overflow-y: scroll;
	background-color: var(--white);
	-webkit-transition: var(--transition);
	-o-transition: var(--transition);
	transition: var(--transition);
	z-index: 10;
	padding: calc(var(--gutter)*1.4) var(--gutter);
}
#extra:not(.open) {
	cursor: pointer;
}
#extra:not(.open):hover {
	-webkit-transform: translateX(14vw);
	    -ms-transform: translateX(14vw);
	        transform: translateX(14vw);
}
#extra.open {
	-webkit-transform: translateX(0);
	    -ms-transform: translateX(0);
	        transform: translateX(0);
}
#extraSwitch {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 80vw;
	-webkit-transform: translateX(-80vw);
	    -ms-transform: translateX(-80vw);
	        transform: translateX(-80vw);
	cursor: pointer;
}
#extraSwitch.open {
	z-index: 10;
	-webkit-transform: translateX(0);
	    -ms-transform: translateX(0);
	        transform: translateX(0);
}
#extra h4 {
	margin-bottom: 6rem;
}
.extra-container {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
	gap: 3rem;
}

@media screen and (max-width: 700px) {
	.intro {
		text-align: left;
		width: 100%;
		max-width: unset;
		padding: calc(var(--gutter)*2.4) var(--gutter) 5rem;
	}
	#singleProject.extra {
		width: 100%;
	}
	#extra {
		width: 100vw;
		-webkit-transform: translateY(100vh);
		    -ms-transform: translateY(100vh);
		        transform: translateY(100vh);
		padding-top: 0;
		margin-top: var(--introHeight);
		height: calc(100vh - var(--introHeight));
		z-index: 6;
		-webkit-transition: none;
		-o-transition: none;
		transition: none;
	}
	#extra:not(.open):hover {
		-webkit-transform: unset;
		    -ms-transform: unset;
		        transform: unset;
	}
	#extra.open {
		-webkit-transform: translateY(0);
		    -ms-transform: translateY(0);
		        transform: translateY(0);
	}
	#extraSwitch {
		position: fixed;
		top: 0;
		left: 0;
		height: var(--introHeight);
		-webkit-transform: translateY(100vh);
		    -ms-transform: translateY(100vh);
		        transform: translateY(100vh);
		width: 100%;
	}
	#extraSwitch.open {
		z-index: 7;
		-webkit-transform: translateY(0);
		    -ms-transform: translateY(0);
		        transform: translateY(0);
	}
	.extra-container {
		margin-bottom: 6rem;
	}
	#extra .intro {
		padding: calc(var(--gutter)*2.4) 0 5rem;
	}
}
</style>