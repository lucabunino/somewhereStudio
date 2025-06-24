<script>
import { urlFor } from '$lib/utils/image';
import { page } from '$app/stores';

let {
	media,
	width = 1080,
	cover = false,
	captionExtra = false,
	linkHeight = 0,
} = $props();

let domLoaded = $state(false);
let imgEl;
let videoEl;
let fullresUrl = media.asset ? urlFor(media.asset).width(width) : null;
let captionHeight = $state(0)

$inspect(captionHeight, linkHeight)

$effect(() => {
	if (imgEl && fullresUrl) {
		const fullres = new Image();
		fullres.src = fullresUrl;
		fullres.onload = () => {
			if (imgEl) {
				imgEl.src = fullres.src;
				domLoaded = true;
			}
		};
	}
});
</script>


<div style="height: 100%;" class:homepage={$page.url.pathname === "/"}>
	<div class="media" class:cover={cover} class:loaded={domLoaded} style={$page.url.pathname === "/" ? `height: 100%; max-height: calc(90vh - ${captionHeight}px - ${linkHeight}px);` : 'height: 100%'}>
		{#if media.mp4}
			<video
				muted
				loop
				autoplay
				playsinline
				bind:this={videoEl}
				src={media.mp4.asset.url}
				poster={media.cover ? urlFor(media.cover.asset).width(1080) : ""}
				on:playing={() => {domLoaded = true}}
			></video>
		{:else if media.asset}
			<img
				src={media.asset.metadata?.lqip}
				alt=""
				bind:this={imgEl}
			/>
		{/if}
		<div class="blur"></div>
	</div>

	{#if media.caption}
		<p class="caption" class:ronzino-12={!captionExtra} class:extra={captionExtra} bind:clientHeight={captionHeight}>
			{media.caption}
		</p>
	{/if}
</div>


<style>
.media {
	position: relative;
}
.media.cover {
	/* width: 100%;
	height: 100%; */
}
.caption {
	text-indent: 3em;
	padding-top: .2rem;
	padding-bottom: var(--gutter);
}
.caption.extra {
	padding-bottom: 4rem;
}
img, video {
	display: block;
	height: 100%;
    width: 100%;
    object-fit: cover;
}
.homepage img, .homepage .video {
	max-height: 90vh;
}
.media.cover img {
	height: 100%;
	object-fit: cover;
}
.blur {
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
	backdrop-filter: blur(30px);
	transition: var(--transition);
}
.media.loaded .blur {
	backdrop-filter: blur(0);
}
</style>