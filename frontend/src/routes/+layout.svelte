<script>
// Imports
import "../app.css";
import { dev } from '$app/environment';
import { page } from '$app/stores';
import { urlFor } from '$lib/utils/image';
import { cubicOut } from 'svelte/easing';
import { goto } from '$app/navigation';
import { writable, derived } from 'svelte/store';
import { slide } from "svelte/transition";
import { onMount } from "svelte";

// Variables
let { data, children } = $props();
let mouse = $state([])
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let scrollY = $state(0)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
let timeout;
let tags = $derived(data.tags.filter(tag => tagger.tags.some(t => t.slug.current === tag.slug.current)))

// Lifecycle
$effect(() => {
	setTimeout(() => {
		domLoaded = true
	}, 1000);
})

// Functions
function handleMousemove(event) {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
}
function toggleTag(tagSlug) {
	const url = new URL(window.location.href);
	const tags = url.searchParams.getAll('tag');

	const tagIndex = tags.indexOf(tagSlug);

	if (tagIndex > -1) {
		// Remove the tag
		const newTags = tags.filter(t => t !== tagSlug);
		url.searchParams.delete('tag'); // clear all first
		newTags.forEach(t => url.searchParams.append('tag', t));
		if (data.searchParams.length > tagger.firstMaxTags) {
			tagger.setMaxTags(tagger.maxTags - 1)
		}
	} else {
		// Add the tag
		url.searchParams.append('tag', tagSlug);
		if (data.searchParams.length > tagger.firstMaxTags) {
			tagger.setMaxTags(data.searchParams.length + 1)
		}
	}
	goto(`/?${url.searchParams.toString()}`, { preload: true, replaceState: false });
}
export function flipVertical(node, { from, to }) {
	const style = getComputedStyle(node);
	const fromTop = from.top - parseFloat(style.marginTop);
	const toTop = to.top - parseFloat(style.marginTop);
	const dy = fromTop - toTop;
	return {
		delay: 0,
		duration: 300,
		easing: cubicOut,
		// css: t => `transform: translateY(${(1 - t) * dy}px);`
	};
}
function handleMouseLeave() {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		tagger.setOpen(false);
	}, 2000);
}
function handleMouseEnter() {
	clearTimeout(timeout);
}

// Dev
let viewGrid = $state(false)
const gridColumnsDesktop = 16
const gridColumnsMobile = 8
function handleKey({key}) {if (key === 'G' && dev) {viewGrid = !viewGrid}}
</script>

<svelte:window bind:innerWidth bind:innerHeight bind:scrollY={scrollY} onkeyup={handleKey} onmousemove={handleMousemove}></svelte:window>

{#if viewGrid}
<div id="layout"
			style="grid-template-columns:repeat({innerWidth > 800 ? gridColumnsDesktop : gridColumnsMobile}, 1fr);pointer-events:none;display: grid;position:fixed; z-index:999;width: -moz-available;width: -webkit-fill-available;height: -moz-available;height: -webkit-fill-available;margin:0 var(--gutter);gap:var(--gutter);opacity:.2;">
	{#each Array(innerWidth > 800 ? gridColumnsDesktop : gridColumnsMobile) as _, i}
		<div style="background-color:red"></div>
	{/each}
</div>
{/if}

<svelte:head>
	{#if data.seo.SEOTitle}<title>{data.seo.SEOTitle}</title>{/if}
	{#if data.seo.SEODescription}<meta name="description" content={data.seo.SEODescription}>{/if}
	<link rel="canonical" href={$page.url}>
	<meta name="robots" content="index,follow">
	<meta name="googlebot" content="index,follow">
	{#if data.seo.SEOTitle}<meta property="og:title" content={data.seo.SEOTitle}>{/if}
	{#if data.seo.SEODescription}<meta property="og:description" content={data.seo.SEODescription}>{/if}
	{#if data.seo.SEOImage}<meta property="og:image" content={urlFor(data.seo.SEOImage).width(2000).url()}>{/if}
	<meta property="og:url" content={$page.url}>
	<meta property="og:type" content="website">
	{#if data.seo.SEOTitle}<meta property="og:site_name" content={data.seo.SEOTitle}>{/if}
</svelte:head>

<header>
		<nav>
			<ul class="menu gaisyr-34"
			class:blurred={scrollY > 100 && $page.url.pathname !== '/index'}
			>
				<li class="menu-item">
					<a href="/">Somewhere<br>Studio</a>
				</li>
				<li class="menu-item">
					<a href="/index">Index</a>
				</li>
				<li class="menu-item">
					<a href="/about">About</a>
				</li>
			</ul>
		</nav>
</header>
{#if domLoaded}
	<div class="tags"
	onmouseleave={() => handleMouseLeave()}
	onmouseenter={() => handleMouseEnter()}>
		<!-- {#if $page.url.pathname === "/" || $page.url.pathname !== "/" && tagger.open} -->
			{#each tags
				.slice()
				.filter(tag => !tag.hidden)
				.sort((a, b) => {
					const activeTags = data.searchParams;
					const aActive = activeTags.includes(a.slug.current);
					const bActive = activeTags.includes(b.slug.current);
					return aActive === bActive ? 0 : aActive ? -1 : 1;
				}) as tag, i (tag.slug.current)}
				<div class="tag"
				animate:flipVertical
				class:active={data.searchParams.includes(tag.slug.current)}
				style="--delay: {i*50}ms"
				>
					{#if tagger.open || i<tagger.maxTags}
						<button onclick={() => toggleTag(tag.slug.current)}
						in:slide|global={{ axis: "x", duration: 200, delay: i*30 }}
						out:slide|global={{ axis: "x", duration: 200, delay: 500 + (tagger.tags.length)*30 - i*30 }}
						>
							<span class="prefix">×</span>{tag.title}
						</button>
					{/if}
				</div>
			{/each}
		<!-- {/if} -->
		{#if !tagger.open}
			<div class="tag">
				<button onclick={() => {tagger.setTags(data.tags); tagger.setOpen(true)}}
				in:slide|global={{ axis: "x", duration: 500, delay: (tagger.maxTags+1)*30 }}
				out:slide|global={{ axis: "x", duration: 500, delay: 500 + (tagger.tags.length - tagger.maxTags)*30 }}
				>...</button>
			</div>
		{/if}
	</div>
{/if}

{#if domLoaded}
	<main>
		{@render children()}
	</main>
{/if}

{#if domLoaded && (data.searchParams.length > 0 || $page.url.pathname !== '/')}
<footer class="ronzino-12 uppercase medium">
	<div>
		{#if data.info.email}<a href="mailto:{data.info.email}">{data.info.email}</a>{/if}
		{#if data.info.adress}
			{#if data.info.adressLink}
				<a href={data.info.adressLink} target="_blank" rel="noopener noreferrer">{data.info.adress}</a>
			{:else}
				<p>{data.info.adress}</p>
			{/if}
		{/if}
	</div>
	{#if data.info.socials}
		<div>
			{#each data.info.socials as social}
				<a href={social.link} target="_blank" rel="noopener noreferrer">{social.label}</a>
			{/each}
		</div>
	{/if}
	{#if data.info.policies}
		<div>
			{#each data.info.policies as policy}
				<a href={policy.slug.current}>{policy.title}</a>
			{/each}
		</div>
	{/if}
	<div>
		<p>©{new Date().getFullYear()} {#if data.info.title}{data.info.title}{/if} {#if data.info.ragioneSociale}{data.info.ragioneSociale}{/if}</p>
		{#if data.info.pIva || data.info.ccia}
			<p>{#if data.info.pIva}P.IVA {data.info.pIva}{/if} {#if data.info.ccia}CCIA {data.info.ccia}{/if}</p>
		{/if}
		{#if data.info.capitaleSociale}<p>CAP. SOC. {data.info.capitaleSociale}</p>{/if}
	</div>
</footer>
{/if}
	
<style>
/* Header */
.menu {
	padding: 0;
	display: flex;
	align-items: flex-end;
	list-style: none;
	position: fixed;
	top: calc(50vh - 2rem);
	left: 0;
	transform: translateY(-50%);
	width: -webkit-fill-available;
	z-index: 9;
	pointer-events: none;
	color: var(--white);
	mix-blend-mode: difference;
}
.menu-item {
	width: 100%;
	padding: 0 var(--gutter);
}
.menu-item a, .menu-item button {
	pointer-events: all;
	transition: var(--transition);
}
.menu.blurred:not(:hover) .menu-item a {
	color: var(--darkGray);
	filter: blur(30px);
}

/* Tags */
.tags {
	position: fixed;
	top: 0;
	padding: calc(var(--gutter)*1.4) var(--gutter);
	max-height: 100%;
	display: flex;
	flex-direction: column;
	overflow-y: scroll;
	z-index: 9;
}

@keyframes openTag {
	0% {padding-left: 0;}
	50% {padding-left: 0;}
	100% {padding-left: 1em;}
}
@keyframes closeTag {
	0% {padding-left: 1em;}
	50% {padding-left: 1em;}
	100% {padding-left: 0;}
}
@keyframes openPrefix {
	0% {width: 0;}
	50% {width: 0;}
	100% {width: 1em;}
}
@keyframes closePrefix {
	0% {width: 1em;opacity: 1;}
	50% {width: 1em;opacity: 1;}
	100% {width: 0;opacity: 0;}
}

.tag {
	cursor: pointer;
	display: block;
	width: fit-content;
	transition: var(--transition);
	transition-property: padding, transform;
	line-height: 1rem;
}
.tag:hover {
	color: var(--darkGray);
	padding-left: 1em;
	transition-delay: 0ms;
}
.tag:hover .prefix {
	color: var(--darkGray);
}
.tag.active {
	z-index: 999;
	padding-left: 1em;
	transition-delay: 500ms;
}
.tag button {
	display: flex;
	align-items: center;
	padding: .5em 1em;
	background-color: var(--white);
	margin-bottom: .3rem;
	white-space: nowrap;
}
.prefix {
	width: 0;
	display: inline-flex;
	overflow-x: hidden;
	transition: var(--transition);
	transition-property: width;
}
.tag.active .prefix {
	width: 1em;
	transition-delay: 500ms;
}

/* Main */
main {
	min-height: calc(100vh - .857rem*1.166*3 - var(--gutter)*12.8);
}

/* Footer */
footer {
	display: flex;
	align-items: flex-start;
	gap: var(--gutter);
	margin-top: calc(var(--gutter)*10);
	padding: calc(var(--gutter)*1.4) var(--gutter);
}
footer div {
	display: flex;
	flex-direction: column;
}
@media screen and (max-width: 900px) {
	footer {
		flex-direction: column;
		align-items: flex-start;
		padding-bottom: 1em;
	}
	footer div {
		display: flex;
		flex-direction: column;
	}
	footer div>*:nth-child(even) {
		margin-bottom: 1.5em;
	}
}

</style>