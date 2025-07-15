<script>
import { urlFor } from '$lib/utils/image';
import { page } from '$app/stores';

let {
	media,
	thumbnail = undefined,
	aspectRatio = undefined,
	width = 1920,
	autoWidth = false,
	cover = false,
	captionExtra = false,
	linkHeight = 0,
} = $props();

let domLoaded = $state(false);
let minimumDomLoaded = $state(false);
let imgEl;
let videoEl;
let fullresUrl = media?.asset ? urlFor(media.asset).width(width) : null;
let captionHeight = $state(0)

$effect(() => {
	setTimeout(() => {
		minimumDomLoaded = true
	}, 200);
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
	if (thumbnail) {
		setTimeout(() => {
			domLoaded = true;
		}, 200);
	}
});
</script>

<div class="media-wrapper" class:autoWidth={autoWidth} class:homepage={$page.url.pathname === "/"}>
	<!-- <div class="media" class:cover={cover} class:loaded={domLoaded && minimumDomLoaded} style={$page.url.pathname === "/" ? `height: 100%; max-height: calc(90vh - ${captionHeight}px - ${linkHeight}px);` : 'height: 100%'}> -->
	<div class="media" class:cover={cover} class:loaded={domLoaded && minimumDomLoaded}>
		{#if media?.mp4}
			<video
				muted
				loop
				autoplay
				playsinline
				bind:this={videoEl}
				src={media.mp4.asset.url}
				poster={media.cover ? urlFor(media.cover.asset).width(1080) : ""}
				style="aspect-ratio: {aspectRatio}"
				on:playing={() => {domLoaded = true}}
			></video>
		{:else if media?.asset}
			<img
				src={media.asset.metadata?.lqip}
				alt=""
				style="aspect-ratio: {aspectRatio}"
				bind:this={imgEl}
			/>
		{/if}
		{#if thumbnail}
			<img
				src={thumbnail}
				alt=""
				style="aspect-ratio: {aspectRatio}"
				bind:this={imgEl}
			/>
		{/if}
		<div class="blur"></div>
	</div>

	{#if media?.caption}
		<p class="caption" class:ronzino-12={!captionExtra} class:extra={captionExtra} bind:clientHeight={captionHeight}>
			{media.caption}
		</p>
	{/if}
</div>


<style>
.media-wrapper {
	height: 100%;
}
.media-wrapper.autoWidth {
	width: auto;
}
.media {
	position: relative;
}
.autoWidth .media {
	height: 100%;
	width: auto;
}
.media.cover {
	width: 100%;
	height: 100%;
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
.autoWidth img, .autoWidth .video {
	width: auto;
}
:global(.homepage img, .homepage video) {
	/* max-height: 145vh; */
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