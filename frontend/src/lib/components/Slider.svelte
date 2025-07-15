<script>
import { register } from 'swiper/element/bundle';register();
import Media from '$lib/components/Media.svelte';register();
import sliderInjectedStyle from '$lib/utils/sliderInjectedStyle';

let {
	slides,
	size = "s",
} = $props()

let swiperEl = $state()
const sizeMap = { xs: 5.5, s: 4.5, m: 3.5, l: 2.5, xl: 1.5 };
const swiperParams = {
	navigation: true,
	injectStyles: [sliderInjectedStyle],
};

$effect(() => {
	Object.assign(swiperEl, swiperParams);
	swiperEl.initialize();
})
</script>

<swiper-container
init={false}
bind:this={swiperEl}
slides-per-view={sizeMap[size]}
centered-slides={true}
space-between={1}
grabCursor={true}
>
{#each slides as image, i}
	<swiper-slide>
		<Media media={image} i={i} />
	</swiper-slide>
{/each}
</swiper-container>

<!-- <div class="key-{key}-prev swiper-button-prev">
	<svg width="20" height="34" xmlns="http://www.w3.org/2000/svg">
		<path d="M20 16.977 5.993 34H0l14.045-16.977L0 0h5.993L20 16.977Z" fill="#fff"/>
	</svg>
</div>
<div class="key-{key}-next swiper-button-next">
	<svg width="20" height="34" xmlns="http://www.w3.org/2000/svg">
		<path d="M20 16.977 5.993 34H0l14.045-16.977L0 0h5.993L20 16.977Z" fill="#fff"/>
	</svg>
</div> -->

<style>
/* Slider */
swiper-container {
	position: relative;
}
swiper-container::part(container) {
	overflow-x: clip;
	overflow-y: visible;
}
swiper-container::part(pagination) {
	font-size: .857rem;
	text-align: left;
	padding: .5em;
	width: -webkit-fill-available;
	bottom: -2.166em;
}
swiper-container::part(bullet), swiper-container::part(bullet-active) {
	width: .8em;
	height: .8em;
	background-color: var(--darkGray);
}
</style>
