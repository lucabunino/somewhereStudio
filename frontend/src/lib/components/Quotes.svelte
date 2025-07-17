<script>
import { register } from 'swiper/element/bundle';register();
let {
	size,
	project,
	slides,
	hiddenProject = false
} = $props()
</script>

<swiper-container
pagination={{
	clickable: true
}}
autoHeight={false}
>
{#each slides as quote, i}
	<swiper-slide class="text">
		<h4 class="gaisyr-34">{quote.quotation}</h4>
		{#if quote.author}
			<h5 class="ronzino-18">{quote.author.title}</h5>
		{/if}
	</swiper-slide>
{/each}
</swiper-container>
{#if slides.length > 1}
	{#if project && !hiddenProject}
		<p class="project ronzino-12 medium uppercase">{project.title}</p>
	{/if}
	{#if hiddenProject}
		<div class="slider-bar {size ? size : ''}"></div>
	{/if}
{/if}

<style>
/* Quote */
.text {
	padding: var(--gutter) calc(var(--gutter)/2);
}
.text > * {
	text-indent: calc(var(--gutter)*6);
}
.text > h4::before {
	content: "\2018";
}
.text > h4::after {
	content: "\2019";
}
.text > h5 {
	margin-top: 1em;
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
@media screen and (max-width: 700px) {
	.text {
		padding-left: var(--gutter);
		padding-right: var(--gutter);
	}
}
</style>
