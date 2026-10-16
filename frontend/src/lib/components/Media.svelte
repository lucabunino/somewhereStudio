<script>
import { urlFor } from '$lib/utils/image';
import { page } from '$app/stores';
import { getZoom } from '$lib/stores/zoom.svelte.js';
const zoomer = getZoom();

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
let minimumDomLoaded = $state(true);
let blurDone = $state(false);
let imgEl = $state(undefined);
let videoEl = $state(undefined);
let captionHeight = $state(0)

// homepage zoom: images are sized to how big they are shown, videos pause when zoomed far out
const isHome = $derived($page.url.pathname === '/');
const scale = $derived(isHome || $page.url.pathname.includes('/index/') ? zoomer.scale : 1);
const lowZoom = $derived(isHome && zoomer.scale <= 0.4);

// smallest width that covers the displayed size, capped at `width`
const WIDTHS = [480, 800, 1200, 1600, 1920, 2560];
function pickWidth(el, scale) {
	const needed = (el.clientWidth || width) * (window.devicePixelRatio || 1) * scale;
	return Math.min(width, WIDTHS.find((w) => w >= needed) ?? width);
}

function whenNear(el, onEnter, onLeave) {
	const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) onEnter();
		else onLeave?.();
	}, { rootMargin: '50%' });
	observer.observe(el);
	return () => observer.disconnect();
}

$effect(() => {
	setTimeout(() => {
		minimumDomLoaded = true
	}, 200);
	if (thumbnail) {
		setTimeout(() => {
			domLoaded = true;
		}, 0);
	}
});

// start loading only once the image gets near the viewport
let imgNear = $state(false);
$effect(() => {
	if (!imgEl || !media?.asset || thumbnail) return;
	const stop = whenNear(imgEl, () => {
		imgNear = true;
		stop();
	});
	return stop;
});

// load (or upgrade, when zooming in) to the width the image is displayed at
let loadedWidth = 0;
$effect(() => {
	if (!imgNear || !imgEl) return;
	const w = pickWidth(imgEl, scale);
	if (w <= loadedWidth) return;
	loadedWidth = w;
	const fullres = new Image();
	fullres.src = urlFor(media.asset).width(w).url();
	// decode off the main thread before swapping, so many swaps at once (zooming) don't freeze a frame
	fullres.decode().then(() => {
		if (imgEl && loadedWidth === w) {
			imgEl.src = fullres.src;
			domLoaded = true;
		}
	}).catch(() => {});
});

// play videos only when near the viewport and not zoomed far out
let videoNear = $state(false);
$effect(() => {
	if (!videoEl) return;
	return whenNear(videoEl, () => (videoNear = true), () => (videoNear = false));
});
$effect(() => {
	if (!videoEl) return;
	if (videoNear && !lowZoom) videoEl.play().catch(() => {});
	else videoEl.pause();
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
				onplaying={() => {domLoaded = true}}
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
		{#if !blurDone}
			<!-- removed after fading out: a backdrop-filter, even at blur(0), costs on every repaint -->
			<div class="blur" ontransitionend={() => { if (domLoaded && minimumDomLoaded) blurDone = true }}></div>
		{/if}
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
    -o-object-fit: cover;
       object-fit: cover;
}
:global(.autoWidth img), :global(.autoWidth .video) {
	width: auto;
}
.media.cover img {
	height: 100%;
	-o-object-fit: cover;
	   object-fit: cover;
}
.blur {
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
	-webkit-backdrop-filter: blur(30px);
	        backdrop-filter: blur(30px);
	-webkit-transition: var(--transition);
	-o-transition: var(--transition);
	transition: var(--transition);
}
.media.loaded .blur {
	-webkit-backdrop-filter: blur(0);
	        backdrop-filter: blur(0);
}
@media screen and (max-width: 700px) {
	.caption {
		text-indent: var(--gutter);
		margin-top: .3rem;
		margin-left: var(--gutter);
	}
}
</style>