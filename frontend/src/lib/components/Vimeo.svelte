<script>
import { onMount } from "svelte";
import Media from "$lib/components/Media.svelte";
import { page } from '$app/stores';
import { PortableText } from '@portabletext/svelte'
import VimeoStyle from "$lib/components/portableTextStyles/VimeoTextStyle.svelte";
import {toPlainText} from '@portabletext/svelte'

// Header
import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

let {
	id,
	hash = null,
	autoplay = true,
	loop = false,
	title = null,
	text1 =  null,
} = $props()

let domLoaded = $state(false);
let isPlaying = $state(false);
let aspectRatio = $state(undefined);
let thumbnail = $state(undefined);
let embed = $state(undefined);
let iframe = $state(undefined);

onMount(async () => {
	const response = await fetch(`/api/vimeo/${id}`);
	const data = await response.json();
	aspectRatio = data.width / data.height;
	thumbnail = data.thumbnail
	embed = data.embed	
	domLoaded = true
});
</script>

{#if domLoaded}
	<div class="vimeo-container" class:homepage={$page.url.pathname === "/"} style="aspect-ratio: {aspectRatio};">
		<div class="media-container">
			<Media thumbnail={thumbnail} cover={true}/>
		</div>
		{#if isPlaying}
			<iframe
				src={embed}
				width="100%"
				frameborder="0"
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
			></iframe>
		{:else}
			<button id="player-icon" onclick={(e) => {e.preventDefault(); isPlaying = true; header.setBlurred(true)}}>
				<svg class="shadow" width="45" height="47" xmlns="http://www.w3.org/2000/svg">
					<g filter="url(#a)">
						<path d="M41 19.501 4.25 38.986V.016L41 19.5Z"/>
					</g>
				</svg>
			</button>
			{#if title || text1}
				<div class="vimeo-info">
					{#if title}<h3 class="gaisyr-19">{title}</h3>{/if}
					{#if text1}
						<p class="ronzino-12">{toPlainText(text1)}</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
.vimeo-container {
	position: relative;
	width: 100%;
}
.homepage {
	max-height: 90vh;
}
.media-container {
	width: 100%;
	height: 100%;
}
iframe {
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
}
#player-icon {
	position: absolute;
	fill: var(--white);
	top: 50%;
	left: 50%;
	transform: translateX(-50%) translateY(-50%);
	z-index: 4;
	padding: 1rem;
	pointer-events: auto;
}
#player-icon:hover svg {
	fill: var(--lightGray);
}
.vimeo-info {
	position: absolute;
	left: 0;
	top: 0;
	z-index: 3;
	width: 100%;
	height: 100%;
	color: var(--white);
	padding: var(--gutter);
	background: linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
}
.vimeo-info h3 {
	margin-bottom: .3em;
	max-width: 450px;
}
.vimeo-info p {
	text-indent: 5rem;
	max-width: 450px;
}
</style>