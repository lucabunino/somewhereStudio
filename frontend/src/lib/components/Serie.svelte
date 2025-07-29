<script>
import Module from "$lib/components/Module.svelte";
import { register } from 'swiper/element/bundle';register();
import { blur } from "svelte/transition";
import sliderInjectedStyle from "$lib/utils/sliderInjectedStyle";

let {
	slides,
	project,
	size,
	hiddenProject = false,
	link = true,
	delayed = true,
	homepage = false,
	position = undefined,
} = $props()


let swiperEl = $state()
const swiperParams = {
	autoHeight: true,
	navigation: true,
	injectStyles: [sliderInjectedStyle],
};

$effect(() => {
	Object.assign(swiperEl, swiperParams);
	swiperEl.initialize();
})
</script>

<div style="position: relative;" class="serie {size ? size : module.size} {position ? position : 'left'}">
	<swiper-container
	init="false"
	bind:this={swiperEl}
	in:blur|global={{ duration: 200, delay: delayed ? 500 : 500 }}
	out:blur|global={{ duration: 200 }}
	>
		{#each slides as module, i}
			<swiper-slide class="slide">
					<Module module={module} i={i} size={size ? size : module.size} hiddenProject={hiddenProject} link={link} delayed={delayed}/>
			</swiper-slide>
		{/each}
	</swiper-container>
	
	{#if project && hiddenProject}
		<p
		in:blur|global={{ duration: 200, delay: delayed ? 500 : 500 }}
		out:blur|global={{ duration: 200 }}
		class="project ronzino-12 medium uppercase">{project.title}</p>
	{/if}
</div>


<style>
.project {
	padding: .5em;
	text-align: right;
	background-color: var(--white);
}
/* Serie */
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
