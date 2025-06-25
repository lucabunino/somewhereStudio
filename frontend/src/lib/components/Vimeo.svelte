<script>
import { onMount } from "svelte";
import Media from "$lib/components/Media.svelte";

let {
	id,
	hash = null,
	autoplay = true,
	loop = false,
} = $props()

let domLoaded = $state(false);
let isPlaying = $state(false);
let aspectRatio = $state(undefined);
let thumbnail = $state(undefined);
let embed = $state(undefined);

onMount(async () => {
	const response = await fetch(`/api/vimeo/${id}`);
	const data = await response.json();
	aspectRatio = data.width / data.height;
	thumbnail = data.thumbnail
	embed = data.embed
	console.log(aspectRatio, thumbnail, embed);
	
	domLoaded = true
});
</script>

{#if domLoaded}
	<div class="vimeo-container" onclick={(e) => {e.preventDefault(); isPlaying = true}} style="aspect-ratio: {aspectRatio};">
			<Media thumbnail={thumbnail}/>
			<button id="player-icon">
				<svg width="45" height="47" xmlns="http://www.w3.org/2000/svg">
					<g filter="url(#a)">
						<path d="M41 19.501 4.25 38.986V.016L41 19.5Z"/>
					</g>
				</svg>
			</button>
		{#if isPlaying}
			<iframe
				src={embed}
				width="100%"
				frameborder="0"
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
			></iframe>
		{/if}
	</div>
{/if}

<style>
.vimeo-container {
	position: relative;
	width: 100%;
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
}
#player-icon svg {
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}
</style>