<script>
import { register } from 'swiper/element/bundle';register();
import Media from '$lib/components/Media.svelte';register();
import sliderInjectedStyle from '$lib/utils/sliderInjectedStyle';

let {
	key,
	slides,
	autoWidth = false,
	linkHeight = 0,
} = $props()

let swiperEl = $state()
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
loop={false}
slides-per-view={'auto'}
space-between={1}
free-mode={true}
grabCursor={true}
>
{#each slides as image, i}
	<swiper-slide>
		<Media media={image} i={i} autoWidth={autoWidth} linkHeight={linkHeight}/>
	</swiper-slide>
{/each}
</swiper-container>

<style>
swiper-slide {
	height: auto;
	width: auto;
}
swiper-container {
	width: 100%;
	height: 100%;
}
</style>
