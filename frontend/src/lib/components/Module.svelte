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
import BoxTextStyle from "$lib/components/portableTextStyles/BoxTextStyle.svelte";
import { PortableText } from '@portabletext/svelte'
import { page } from '$app/stores';
let {
	module,
	i,
	size,
	hiddenProject = false,
	link = true,
	delayed = true,
	color = null,
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
					<h3 class="ronzino-18">{module.textTitle}</h3>
				{/if}
                {#if module.text1}
                    <div>
                        <PortableText
                        value={module.text1}
                        components={{
                        block: {
                            normal: BoxTextStyle,
                            h3: BoxTextStyle,
                        },
                        listItem: BoxTextStyle,
                        marks: {
                            link: BoxTextStyle,
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
                <div class="text text-big gaisyr-34" class:noFloat={!module.text2}>
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
	    <p class="gaisyr-34 todo">No style for {module.title} {module.kind}</p>
	{/if}
	{#if !hiddenProject && module.project?.slug}
        {#if !['box'].includes(module.kind)}
            <div class="project ronzino-12 medium uppercase" bind:clientHeight={linkHeight}>{module.project.title}</div>
        {/if}
	{/if}
{/snippet}


{#if domLoaded}
	{#if link}
		{#if innerWidth > 700}
			<a class:homepage={$page.url.pathname === "/"} class="module {size ? size : module.size} {(module.kind === "composition" && module.fixedHeight) ? 'fixedHeight' : 'autoHeight'} {module.position ? module.position : 'left'}" data-kind={module.kind}
			href={module.project?.slug ? `/index/${module.project.slug.current}` : ``}
			style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
			in:blur|global={{ duration: 400, amount: 20, delay: delayed ? 400 + i*50 : 400 }}
			out:blur|global={{ duration: 400, amount: 20 }}
			>
				{@render moduleContent(module)}
			</a>
		{:else}
			<a class:homepage={$page.url.pathname === "/"} class="module {size ? size : module.size} {(module.kind === "composition" && module.fixedHeight) ? 'fixedHeight' : 'autoHeight'} {module.position ? module.position : 'left'}" data-kind={module.kind}
			href={module.project?.slug ? `/index/${module.project.slug.current}` : ``}
			style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
			>
				{@render moduleContent(module)}
			</a>
		{/if}
	{:else}
		{#if innerWidth > 700}
			<div class:homepage={$page.url.pathname === "/"} class="module {size ? size : module.size} {(module.kind === "composition" && module.fixedHeight) ? 'fixedHeight' : ''} {module.position ? module.position : 'left'}" data-kind={module.kind}
			style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
			in:blur|global={{ duration: 200, amount: 100, delay: delayed ? 500 + i*50 : 500 }}
			out:blur|global={{ duration: 200, amount: 100 }}
			>
				{@render moduleContent(module)}
			</div>
		{:else}
			<div class:homepage={$page.url.pathname === "/"} class="module {size ? size : module.size} {(module.kind === "composition" && module.fixedHeight) ? 'fixedHeight' : ''} {module.position ? module.position : 'left'}" data-kind={module.kind}
			style="background-color: {color ? 'var(--white)' : module.color?.hex}; color: {isDark(module.color?.hex) && !color ? "var(--white)" : "var(--black)"}"
			>
				{@render moduleContent(module)}
			</div>
		{/if}
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
	display: -ms-grid;
	display: grid;
	gap: 1px;
}
[data-kind="composition"] .media-container.fixedHeight {
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
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
}
@media screen and (max-width: 700px) {
	:global(:not(.serie)>*>*>[data-kind="vimeo"]) {
		width: 100vw;
	}
	:global(.scattered [data-kind="vimeo"]) {
		width: 90vw;
	}
}
/* ShortText */
[data-kind="shortText"] .text {
	padding: var(--gutter) calc(var(--gutter)/2) calc(var(--gutter)*2);
	margin-left: 18rem;
	text-indent: -18rem;
}
@media screen and (max-width: 1200px) {
	[data-kind="shortText"] .text {
		margin-left: 14rem;
		text-indent: -14rem;
	}
}
@media screen and (max-width: 700px) {
	[data-kind="shortText"] .text {
		padding-top: calc(var(--gutter)*1.4);
		padding-left: var(--gutter);
		padding-right: var(--gutter);
		margin-left: 10rem;
		text-indent: -10rem;
	}
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
[data-kind="longText"] .text-big.noFloat {
	float: unset;
	width: auto;
	margin-left: 0;
	text-indent: 50%;
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
@media screen and (max-width: 1200px) {
	[data-kind="longText"] .text-big {
		width: calc(100% - 14rem);
	}
}
@media screen and (max-width: 700px) {
	[data-kind="longText"] .text {
		padding-top: calc(2.428rem*.970*3 - 1.3rem + var(--gutter)*1.4);
		padding-left: var(--gutter);
		padding-right: var(--gutter);
	}
	[data-kind="longText"] .text-big {
		width: calc(100% - 10rem);
	}
}
/* Box */
[data-kind="box"] .media-container {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
    -ms-flex-wrap: wrap;
        flex-wrap: wrap;
    width: 100%;
}
[data-kind="box"] .side-left {
	-webkit-box-orient: horizontal;
	-webkit-box-direction: reverse;
	    -ms-flex-direction: row-reverse;
	        flex-direction: row-reverse;
}
[data-kind="box"] .text-container {
	width: 100%;
}
[data-kind="box"] .text {
	padding: var(--gutter) calc(var(--gutter)/2);
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
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
@media screen and (max-width: 700px) {
	[data-kind="box"] .media-container {
		-webkit-box-orient: vertical;
		-webkit-box-direction: reverse;
		    -ms-flex-direction: column-reverse;
		        flex-direction: column-reverse;
	}
	[data-kind="box"] .text-container {
		width: 100%;
	}
	[data-kind="box"] .text {
		width: 100%;
		padding-top: calc(var(--gutter)*1.4);
		padding-left: var(--gutter);
		padding-right: var(--gutter);
	}
	[data-kind="box"] .img {
		width: auto;
		margin-bottom:2rem;
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
}

/* General */
:global(.scattered .text-container) {
	max-height: 100vh;
    overflow: scroll;
}
.homepage[data-kind="slider"] {
	width: 80vw;
}
.homepage[data-kind="composition"] .media-container.fixedHeight {
	max-width: 80vw;
}
</style>