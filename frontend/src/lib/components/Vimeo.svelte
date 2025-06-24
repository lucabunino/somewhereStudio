<script>
import { onMount } from "svelte";
import Media from "$lib/components/Media.svelte";
let {
	id,
	autoplay = true,
	loop = false,
	cover
} = $props()

let aspectRatio = $state(null)
let isPlaying = $state(false);

onMount(async () => {
	const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`);
	const data = await response.json();
	const width = data.width;
	const height = data.height;
	aspectRatio = width / height;
});
</script>

{#if cover}
{$inspect(cover)}
	<div class="vimeo-container" onclick={(e) => {e.preventDefault(); isPlaying = true}}>
			<Media media={cover} width={1920}/>
			<button id="player-icon">
				<svg width="45" height="47" xmlns="http://www.w3.org/2000/svg">
					<g filter="url(#a)">
						<path d="M41 19.501 4.25 38.986V.016L41 19.5Z"/>
					</g>
				</svg>
			</button>
		{#if isPlaying}
			<iframe
				src={`https://player.vimeo.com/video/${id}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`}
				width="100%"
				style="aspect-ratio: {aspectRatio};"
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