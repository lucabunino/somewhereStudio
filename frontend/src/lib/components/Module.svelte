<script>
import { blur } from "svelte/transition";
import { isDark } from "$lib/utils/color";
import Media from "$lib/components/Media.svelte";
import Vimeo from "$lib/components/Vimeo.svelte";
import Quotes from "$lib/components/Quotes.svelte";
import Slider from "$lib/components/Slider.svelte";
import SliderFixedHeight from "$lib/components/SliderFixedHeight.svelte";
import ShortTextStyle from "$lib/components/portableTextStyles/ShortTextStyle.svelte";
import LongTextStyle from "$lib/components/portableTextStyles/LongTextStyle.svelte";
import BoxStyle from "$lib/components/portableTextStyles/BoxStyle.svelte";
import { PortableText } from '@portabletext/svelte'
let {
	module,
	i,
	size,
	hiddenProject = false,
	link = true,
	delayed = true,
	color = null
} = $props()

let linkHeight = $state(0)
let domLoaded = $state(false)

$effect(() => {
	domLoaded = true
})
</script>

{#snippet moduleContent(module)}
	{#if ['image', 'shortVideo'].includes(module.kind)}
		<div class="media-container">
			<Media media={module.media[0]} linkHeight={linkHeight} width={ module.size === 'xl' ? 2560 : module.size === 'l'  ? 1920 : 1080 }/>
		</div>
	{:else if ['composition'].includes(module.kind)}
		{#if !module.fixedHeight}
			<div class="media-container" style="grid-template-columns: repeat({module.media.length}, 1fr);">
				{#each module.media as media, i}
					<Media media={media} linkHeight={linkHeight}/>
				{/each}
			</div>
		{:else}
			<div class="media-container fixedHeight" style="height: calc(100% - {linkHeight}px);">
				<SliderFixedHeight slides={module.media} autoWidth={true} linkHeight={linkHeight} key={module._id}/>
				<!-- {#each module.media as media, i}
					<Media media={media} linkHeight={linkHeight}/>
				{/each} -->
			</div>
		{/if}
	{:else if ['slider'].includes(module.kind)}
		<Slider slides={module.media} size={module.size} key={module._id}/>
	{:else if ['vimeo'].includes(module.kind)}
		<div class="media-container">
			<Vimeo id={module.id} hash={module.hash} cover={module.cover} title={module.textTitle}  text1={module.text1}/>
		</div>
	{:else if ['box'].includes(module.kind)}
		<!-- <div class="media-container" style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"> -->
		<div class="media-container {module.side ? `side-${module.side}` : ``}">
			<div class="text">
                {#if module.textTitle}
					<h3 class="ronzino-24">{module.textTitle}</h3>
				{/if}
                {#if module.text1}
                    <div>
                        <PortableText
                        value={module.text1}
                        components={{
                        block: {
                            normal: BoxStyle,
                            h3: BoxStyle,
                        },
                        listItem: BoxStyle,
                        marks: {
                            link: BoxStyle,
                        },
                        }}/>
                    </div>
                {/if}
			</div>
			<div class="img">
				<Media media={module.media[0]} linkHeight={linkHeight}/>
			</div>
            {#if module.project?.slug && !hiddenProject}
                <p class="project ronzino-12 medium uppercase">{module.project.title}</p>
            {/if}
		</div>
	{:else if ['shortText'].includes(module.kind)}
        {#if module.text1}
            <div class="text gaisyr-34">
                <PortableText
                value={module.text1}
                components={{
                block: {
                    normal: ShortTextStyle,
                    h3: ShortTextStyle,
                },
                listItem: ShortTextStyle,
                marks: {
                    link: ShortTextStyle,
                },
                }}/>
            </div>
        {/if}
	{:else if ['longText'].includes(module.kind)}
        <div class="text-container {module.side ? `side-${module.side}` : ``}">
            {#if module.text1}
                <div class="text text-big gaisyr-34">
                    <PortableText
                    value={module.text1}
                    components={{
                    block: {
                        normal: LongTextStyle,
                        h3: LongTextStyle,
                    },
                    listItem: LongTextStyle,
                    marks: {
                        link: LongTextStyle,
                    },
                    }}/>
                </div>
            {/if}
            {#if module.text2}
                <div class="text text-small">
                    <PortableText
                    value={module.text2}
                    components={{
                    block: {
                        normal: LongTextStyle,
                        normalReading: LongTextStyle,
                        h3: LongTextStyle,
                    },
                    listItem: LongTextStyle,
                    marks: {
                        link: LongTextStyle,
                    },
                    }}/>
                </div>
            {/if}
        </div>
	{:else if ['quote'].includes(module.kind)}
	    <Quotes slides={module.quotes} hiddenProject={hiddenProject ? true : false}/>
	{:else}
	    <p class="gaisyr-34 todo">No style for {module.kind}</p>
	{/if}
	{#if !hiddenProject}
        {#if !['box'].includes(module.kind)}
            <div class="project ronzino-12 medium uppercase" bind:clientHeight={linkHeight}>{#if module.project?.slug}{module.project.title}{:else}<span style="color: red;">No linked project</span>{/if}</div>
        {/if}
	{/if}
{/snippet}


{#if domLoaded}
	{#if link}
		<a class="module {size ? size : module.size} {module.fixedHeight ? 'fixedHeight' : ''} {module.position ? module.position : 'left'}" data-kind={module.kind}
		href={module.project?.slug ? `/index/${module.project.slug.current}` : ``}
		style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
		in:blur|global={{ duration: 200, amount: 100, delay: delayed ? 500 + i*50 : 500 }}
		out:blur|global={{ duration: 200, amount: 100 }}
		>
			{@render moduleContent(module)}
		</a>
	{:else}
		<div class="module {size ? size : module.size} {module.fixedHeight ? 'fixedHeight' : ''} {module.position ? module.position : 'left'}" data-kind={module.kind}
		style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
		in:blur|global={{ duration: 200, amount: 100, delay: delayed ? 500 + i*50 : 500 }}
		out:blur|global={{ duration: 200, amount: 100 }}
		>
			{@render moduleContent(module)}
		</div>
	{/if}
{/if}


<style>
.module {
	display: block;
	/* height: 100%; */
	background-color: var(--white);
}
.project {
	padding: .5em;
	text-align: right;
}
.media-container {
	height: 100%;
	overflow: hidden;
	position: relative;
}
/* Composition */
[data-kind="composition"] .media-container {
	display: grid;
	gap: 1px;
}
[data-kind="composition"] .media-container.fixedHeight {
	/* display: flex;
	overflow: scroll;
	gap: 1px; */
	display: block;
	width: auto;
	max-width: 100vw;
}
/* Slider */
[data-kind="slider"] {
	width: 100vw;
}
/* Vimeo */
[data-kind="vimeo"] .media-container {
	display: flex;
}
/* ShortText */
[data-kind="shortText"] .text {
	padding: var(--gutter) calc(var(--gutter)/2) calc(var(--gutter)*2);
	margin-left: 18rem;
	text-indent: -18rem;
}
/* LongText */
[data-kind="longText"] .text-container {
	position: relative;
}
[data-kind="longText"] .text {
	padding: calc(2.428rem*.970*3 - 1.3rem) calc(var(--gutter)/2) var(--gutter);
}
[data-kind="longText"] .text-big {
	float: right;
	width: 50%;
	shape-outside: margin-box;
	margin-left: var(--gutter);
    margin-top: calc((2.428rem*.970*3 - 1.3rem)*-1)
}
[data-kind="longText"] .side-left .text-big {
	float: left;
}
[data-kind="longText"] .text-small {
	clear: left;
}
[data-kind="longText"] .side-left .text-small {
	clear: right;
}
/* Box */
[data-kind="box"] .media-container {
	display: flex;
    flex-wrap: wrap;
    width: 100%;
}
[data-kind="box"] .side-left {
	flex-direction: row-reverse;
}
[data-kind="box"] .text-container {
	width: 100%;
}
[data-kind="box"] .text {
	padding: var(--gutter) calc(var(--gutter)/2);
	display: flex;
	flex-direction: column;
	width: 50%;
}
[data-kind="box"] .img {
	width: 50%;
}
[data-kind="box"] h3 {
	margin-bottom: 1em;
}
[data-kind="box"] .text p:not(.project) {
	margin-bottom: 1em;
}
[data-kind="box"] .project {
    width: 100%;
}
</style>