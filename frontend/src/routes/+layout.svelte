<script>
// Imports
import "../app.css";
import { dev } from '$app/environment';
import { page } from '$app/stores';
import { urlFor } from '$lib/utils/image';
import { cubicOut } from 'svelte/easing';
import { goto } from '$app/navigation';
import { writable, derived } from 'svelte/store';
import { slide, blur } from "svelte/transition";
import { onMount } from "svelte";

// Variables
let { data, children } = $props();
let mouse = $state([])
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let scrollY = $state(0)
let oldScroll = $state(0)
let blurredHeader = $state(false)
let search = $state("")
let searchActive = $state(false)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
let timeout;
let tags = $derived(data.tags.filter(tag => tagger.tags.some(t => t.slug.current === tag.slug.current)))

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

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
		duration: 200,
		easing: cubicOut,
		css: t => `transform: translateY(${(1 - t) * dy}px);`
	};
}
function handleMouseLeave() {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		tagger.setOpen(false);
	}, 1000);
}
function handleMouseEnter() {
	clearTimeout(timeout);
}
function handleScroll() {
	const delta = 50;
	const diff = scrollY - oldScroll;
	if (scrollY < delta) {
		blurredHeader = false;
		oldScroll = scrollY;
	}
	if (Math.abs(diff) > delta) {
		if (diff > 0) {
			blurredHeader = true;
		} else {
			blurredHeader = false;
		}
		oldScroll = scrollY;
	}
}

function openTagger() {
	tagger.setTags(data.tags, { keepHierarchy: true });
	tagger.setOpen(true)
}
function closeTagger() {
	tagger.setOpen(false)
}

// Dev
let viewGrid = $state(false)
const gridColumnsDesktop = 16
const gridColumnsMobile = 8
function handleKey({key}) {if (key === 'G' && dev) {viewGrid = !viewGrid}}
</script>

<svelte:window bind:innerWidth bind:innerHeight bind:scrollY={scrollY} onkeyup={handleKey} onmousemove={handleMousemove} onscroll={handleScroll}></svelte:window>

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
			class:blurred={blurredHeader && $page.url.pathname !== '/index'}
			>
				<li class="menu-item" class:active={$page.url.pathname === "/"}>
					<a href="/">Som<span class="ls-7">e</span><span class="ls-15">w</span><span class="ls-30">h</span><span class="ls-70">e</span><span class="ls-120">r</span>e<br>Studio</a>
				</li>
				<li class="menu-item" class:active={$page.url.pathname === "/index" || $page.url.pathname.includes("/index/")}>
					<a href="/index">In<span class="ls-7">d</span><span class="ls-30">e</span>x</a>
				</li>
				<li class="menu-item" class:active={$page.url.pathname === "/about"}>
					<a href="/about"><span class="ls-30">A</span><span class="ls-70">b</span><span class="ls-30">o</span><span class="ls-7">u</span>t</a>
				</li>
			</ul>
		</nav>
		{#if $page.url.pathname === "/"}
			<a href="/map" id="coordinates" class="btn tag ronzino-12"
			in:slide|global={{ axis: "x", duration: 200 }}
			out:slide|global={{ axis: "x", duration: 200, delay: 500 }}
			>
				<span>{coordinater.formattedCoordinates.latitude}N, {coordinater.formattedCoordinates.longitude}E</span>
				<span class="cta uppercase">Vedi mappa</span>
			</a>
		{/if}
		<div class="zoom">
			<button id="zoom-out" class="btn" class:off={zoomer.zoom == zoomer.minZoom} onclick={() => {zoomer.decreaseZoom()}}>
				<svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.5 14a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/>
					<path d="M10 7.5H5" stroke-miterlimit="10"/>
					<path d="M16.9 17 12 12.2"/>
				</svg>
			</button>
			<button id="zoom-in" class="btn" class:off={zoomer.zoom == zoomer.maxZoom} onclick={() => {zoomer.increaseZoom()}}>
				<svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.5 14a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/>
					<path d="M10 7.5H5M7.5 10V5" stroke-miterlimit="10"/>
					<path d="M16.9 17 12 12.2"/>
				</svg>
			</button>
		</div>
</header>
{#if domLoaded}
	<div class="tags"
	onmouseleave={() => handleMouseLeave()}
	onmouseenter={() => handleMouseEnter()}>
	<div id="search-bar">
		<input id="search" type="text" class="btn" placeholder="Cerca nel sito" bind:value={search} onclick={() => {searchActive = true}}>
		{#if searchActive}
			<button class="btn ronzino-12 uppercase" onclick={() => {searchActive = false; search = ""}}>× Chiudi</button>
		{/if}
	</div>
		<!-- {#if $page.url.pathname === "/" || $page.url.pathname !== "/" && tagger.open} -->
			{#each tagger.tags
				.slice()
				.filter(tag => !tag.hidden)
				.sort((a, b) => {
					const activeTags = data.searchParams;
					const aActive = activeTags.includes(a.slug.current);
					const bActive = activeTags.includes(b.slug.current);

					// Active tags come first
					if (aActive !== bActive) return aActive ? -1 : 1;

					// Then by descending temp
					const tempDiff = (b.temp ?? 0) - (a.temp ?? 0);
					if (tempDiff !== 0) return tempDiff;

					// Finally, alphabetical order by title (fallback to slug if needed)
					return (a.title ?? a.slug.current).localeCompare(b.title ?? b.slug.current);
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
		<div class="tag">
			<button onclick={() => {!tagger.open ? openTagger() : closeTagger()}}
			in:slide|global={{ axis: "x", duration: 500, delay: (tagger.maxTags+1)*30 }}
			out:slide|global={{ axis: "x", duration: 500, delay: 500 + (tagger.tags.length - tagger.maxTags)*30 }}
			>{#if !tagger.open}...{:else}× Chiudi{/if}</button>
		</div>
	</div>
{/if}

{#if domLoaded}
	{#key data.pathname}
		<main
		in:blur|global={{ duration: 200, delay: 500 }}
		out:blur|global={{ duration: 200, delay: 0 }}
		>
			{@render children()}
		</main>
	{/key}
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
.menu-item span {
	transition: var(--transition);
}
.menu-item:hover .ls-7, .menu-item.active .ls-7 {letter-spacing: .07em;}
.menu-item:hover .ls-15, .menu-item.active .ls-15 {letter-spacing: .15em;}
.menu-item:hover .ls-30, .menu-item.active .ls-30 {letter-spacing: .30em;}
.menu-item:hover .ls-70, .menu-item.active .ls-70 {letter-spacing: .70em;}
.menu-item:hover .ls-120, .menu-item.active .ls-120 {letter-spacing: 1.20em;}
.menu.blurred:not(:hover) .menu-item a {
	color: var(--darkGray);
	filter: blur(30px);
}

/* ui */
#coordinates {
	position: fixed;
	top: calc(var(--gutter)*1.4);
	left: 50%;
	transform: translateX(-50%);
	z-index: 1;
	font-variant-numeric: tabular-nums;
	width: 180px;
	justify-content: center;
	color: var(--darkGray);
	overflow: hidden;
}
#coordinates.off {
	width: 0;
	padding: 0;
}
#coordinates .cta {
	opacity: 0;
	width: 0;
	color: var(--black);
}
#coordinates:hover span {
	opacity: 0;
	width: 0;
}
#coordinates:hover .cta {
	opacity: 1;
	width: auto;
}
.zoom {
	position: fixed;
	top: calc(var(--gutter)*1.4);
	right: var(--gutter);
	display: flex;
	justify-content: flex-end;
	gap: .3rem;
	z-index: 1;
}
.zoom svg {
	stroke: var(--darkGray);
}
.zoom button:hover svg {
	stroke: var(--black);
}
.zoom button.off {
	cursor: default;
}
.zoom button.off svg {
	stroke: var(--lightGray);
}

/* Tags */
#search-bar {
	display: flex;
	gap: .3em;
}
#search {
	outline: none;
	border: none;
}
#search::placeholder {
	color: var(--darkGray);
}
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
	min-height: 100vh;
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