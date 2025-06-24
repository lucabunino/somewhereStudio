<script>
import { blur } from "svelte/transition";
import { isDark } from "$lib/utils/color";
import Media from "$lib/components/Media.svelte";
import Vimeo from "$lib/components/Vimeo.svelte";
import Quotes from "$lib/components/Quotes.svelte";
import Slider from "$lib/components/Slider.svelte";
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
	delayed = true
} = $props()
let linkHeight = $state(0)
</script>

{#snippet moduleContent(module)}
	{#if ['image', 'shortVideo'].includes(module.kind)}
		<div class="media-container">
			<Media media={module.media[0]} linkHeight={linkHeight}/>
		</div>
	{:else if ['composition'].includes(module.kind)}
		<div class="media-container" style="grid-template-columns: repeat({module.media.length}, 1fr)">
			{#each module.media as media, i}
				<Media media={media} linkHeight={linkHeight}/>
			{/each}
		</div>
	{:else if ['slider'].includes(module.kind)}
		<Slider slides={module.media} size={module.size}/>
	{:else if ['vimeo'].includes(module.kind)}
		<div class="media-container">
			<Vimeo id={module.id} cover={module.cover}/>
		</div>
	{:else if ['box'].includes(module.kind)}
		<div class="media-container" style="background-color: {module.color?.hex}; color: {isDark(module.color?.hex) ? "var(--white)" : ""}">
			<div class="text">
                <h3 class="ronzino-24">{module.title}</h3>
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
            {#if module.project?.slug}
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
        <div class="text-container">
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

{#if link}
	<a class="module {size ? size : module.size} {module.position ? module.position : 'left'}" data-kind={module.kind}
	href={module.project?.slug ? `/index/${module.project.slug.current}` : ``}
	in:blur|global={{ duration: 200, delay: delayed ? 500 + i*50 : 500 }}
	out:blur|global={{ duration: 200 }}
	>
		{@render moduleContent(module)}
	</a>
{:else}
	<div class="module {size ? size : module.size} {module.position ? module.position : 'left'}" data-kind={module.kind}
	in:blur|global={{ duration: 200, delay: delayed ? 500 + i*50 : 500 }}
	out:blur|global={{ duration: 200 }}
	
	>
		{@render moduleContent(module)}
	</div>
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
[data-kind="longText"] .text-small {
	clear: inline-start;
	/* margin-top: calc(2.428rem*.970*3 - 1.3rem); */
}
/* Box */
[data-kind="box"] .media-container {
	display: flex;
    flex-wrap: wrap;
    width: 100%;
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