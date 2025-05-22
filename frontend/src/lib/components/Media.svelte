<script>
import { urlFor } from '$lib/utils/image';
let {
	media,
	width = 1080,
	cover = false,
	captionExtra = false,
} = $props()

let domLoaded = $state()
$effect(() => {
	setTimeout(() => {
		domLoaded = true;
	}, 1000);
})
</script>

<div style="height: 100%;">
	<div class="media" class:cover={cover} class:loaded={domLoaded}>
		{#if media.mp4}
			<video muted loop autoplay playsinline
			src={media.mp4.asset.url}
			placeholder={media.cover ? urlFor(media.cover.asset).width(1080) : ""}
			></video>
		{:else if media.asset}
			<img src={domLoaded ? urlFor(media.asset).width(width) : urlFor(media.asset).width(100)} alt="">
		{/if}
		<div class="blur"></div>
	</div>
	{#if media.caption}
		<p class="caption" class:ronzino-12={!captionExtra} class:extra={captionExtra}>{media.caption}</p>
	{/if}
</div>


<style>
.media {
	position: relative;
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
img {
	display: block;
	width: 100%;
	height: auto;
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