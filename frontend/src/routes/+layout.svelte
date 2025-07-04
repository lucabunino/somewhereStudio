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
import { clickOutside } from '$lib/utils/clickOutside.js';

// Variables
let { data, children } = $props();
let mouse = $state([])
let domLoaded = $state(false)
let mainLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let scrollY = $state(0)
let oldScroll = $state(0)
let search = $state("")
let searchActive = $state(false)
let searchActiveMobile = $state(false)
let menuActive = $state(false)
let searchMobile = $state(null)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
let timeout;
let tags = $derived(data.tags.filter(tag => tagger.tags.some(t => t.slug.current === tag.slug.current)))

// Bg
import { getBg } from '$lib/stores/bg.svelte.js';
let bger = getBg()

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

// Header
import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

// Extra
import { getExtra } from '$lib/stores/extra.svelte.js';
let extraer = getExtra()

// Lifecycle
onMount(() => {
	coordinater.setCoordinates(data.info.adressLatitude, data.info.adressLongitude)
})
$effect(() => {
	setTimeout(() => {
		domLoaded = true
	}, 1500);
	setTimeout(() => {
		mainLoaded = true
	}, 3000);
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
	goto($page.url.pathname === "/" || $page.url.pathname === "/map" ? `?${url.searchParams.toString()}` : `/?${url.searchParams.toString()}`, { preload: true, replaceState: false });
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
		header.setBlurred(false);
		oldScroll = scrollY;
	}
	if (Math.abs(diff) > delta) {
		if (diff > 0) {
			header.setBlurred(true);			
		} else {
			header.setBlurred(false);
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
function handleClickOutside() {
	searchActive = false
}
function handleClickOutsideMobile() {
	searchActiveMobile = false
}

function handleReset(e) {
	e.preventDefault();
	zoomer.resetMapZoom();
	coordinater.setCoordinates(data.info.adressLatitude, data.info.adressLongitude);
}

function handleSearchBtnMobile() {
	if (searchActive) {
		console.log("search " + search);		
	} else {
		searchActiveMobile = true
		setTimeout(() => {
			searchMobile.focus()
		}, 100);
	}
	
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
	<!-- Menu -->
	<nav aria-label="menu shadow">
		{#if menuActive}
			<div class="menu-bg"></div>
		{/if}
		<ul class="menu gaisyr-34 mobile-gaisyr-30"
		class:blurred={header.blurred && $page.url.pathname !== '/index'}
		>
			<li class="menu-item" class:visible={menuActive || $page.url.pathname === "/"} class:active={$page.url.pathname === "/"} onclick={() => {menuActive = false}}>
				<a href="/{$page.url.search}">Som<span class="ls-7">e</span><span class="ls-15">w</span><span class="ls-30">h</span><span class="ls-70">e</span><span class="ls-120">r</span>e<br>Studio</a>
			</li>
			<li class="menu-item" class:visible={menuActive || $page.url.pathname === "/index"} class:active={$page.url.pathname === "/index" || $page.url.pathname.includes("/index/")} onclick={() => {menuActive = false}}>
				<a href="/index">In<span class="ls-7">d</span><span class="ls-30">e</span>x</a>
			</li>
			<li class="menu-item" class:visible={menuActive || $page.url.pathname === "/about"} class:active={$page.url.pathname === "/about"} onclick={() => {menuActive = false}}>
				<a href="/about"><span class="ls-30">A</span><span class="ls-70">b</span><span class="ls-30">o</span><span class="ls-7">u</span>t</a>
			</li>
		</ul>
	</nav>

	<!-- UI desktop -->
	<nav aria-label="ui-desktop">
		{#if domLoaded}
			{#if $page.url.pathname === "/" || $page.url.pathname === "/map"}
				<a href="/map{$page.url.search}" id="coordinates-desktop" class="btn tag ronzino-12"
				in:slide|global={{ axis: "x", duration: 200 }}
				out:slide|global={{ axis: "x", duration: 200, delay: 500 }}
				onclick={(e) => {$page.url.pathname === "/map" ? handleReset(e) : ''}}
				>
					<span>{$page.url.pathname === "/map" ? coordinater.formattedCoordinates.latitude : coordinater.animatedCoordinates.latitude}N, {$page.url.pathname === "/map" ? coordinater.formattedCoordinates.longitude : coordinater.animatedCoordinates.longitude}E</span>
					{#if $page.url.pathname !== "/map"}
						<span class="cta uppercase">Vedi mappa</span>
					{:else}
						<span class="cta uppercase">Reset position</span>
					{/if}
				</a>
			{/if}
			<div id="zoom" class:extra={extraer.extra} class="shadow">
				<button id="zoom-out" class="btn" class:off={($page.url.pathname === '/' && zoomer.zoom == zoomer.minZoom) || ($page.url.pathname === '/map' && zoomer.mapZoom <= zoomer.mapMinZoom + .1)}
				onclick={() => {$page.url.pathname === "/map" ? zoomer.decreaseMapZoom() : zoomer.decreaseZoom()}}
				in:slide|global={{ axis: "-x", duration: 200, delay: 50 }}
				out:slide|global={{ axis: "-x", duration: 200, delay: 500 }}
				>
					<svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.5 14a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/>
						<path d="M10 7.5H5" stroke-miterlimit="10"/>
						<path d="M16.9 17 12 12.2"/>
					</svg>
				</button>
				<button id="zoom-in" class="btn" class:off={($page.url.pathname === '/' && zoomer.zoom == zoomer.maxZoom) || ($page.url.pathname === '/map' && zoomer.mapZoom >= zoomer.mapMaxZoom - .1)}
				onclick={() => {$page.url.pathname === "/map" ? zoomer.increaseMapZoom() : zoomer.increaseZoom()}}
				in:slide|global={{ axis: "-x", duration: 200 }}
				out:slide|global={{ axis: "-x", duration: 200, delay: 500 }}
				>
					<svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.5 14a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/>
						<path d="M10 7.5H5M7.5 10V5" stroke-miterlimit="10"/>
						<path d="M16.9 17 12 12.2"/>
					</svg>
				</button>
			</div>
		{/if}
	</nav>

	<!-- UI mobile -->
	<nav aria-label="ui-mobile" class="ronzino-12 uppercase" use:clickOutside onclick_outside={() => handleClickOutsideMobile()}>
		{#if !searchActiveMobile}
			<a href="/map{$page.url.search}" id="coordinates-mobile" class="btn shadow"
			onclick={(e) => {$page.url.pathname === "/map" ? handleReset(e) : ''; menuActive = false}}
			>
				<span>{$page.url.pathname === "/map" ? coordinater.formattedCoordinates.latitude : coordinater.animatedCoordinates.latitude}N, {$page.url.pathname === "/map" ? coordinater.formattedCoordinates.longitude : coordinater.animatedCoordinates.longitude}E</span>
			</a>
			<button id="menuSwitch" class="btn shadow" onclick={(e) => {menuActive = !menuActive}}>
				{#if !menuActive}Menu{:else}Chiudi{/if}
			</button>
		{:else}
			<input id="search-mobile" type="text" class="btn search shadow gaisyr-14"
			placeholder="Cerca nel sito"
			bind:value={search}
			bind:this={searchMobile}
			>
		{/if}
		<button id="search-btn-mobile" class="btn shadow" onclick={() => {handleSearchBtnMobile()}}
		in:slide|global={{ axis: "x", duration: 200 }}
		out:slide|global={{ axis: "x", duration: 200 }}
		>Cerca</button>
	</nav>
</header>

<!-- Tags -->
{#if domLoaded}
	<div class="tags"
	onmouseleave={() => handleMouseLeave()}
	onmouseenter={() => handleMouseEnter()}
	>
	<div id="search-bar-desktop" class="shadow">
		<input id="search-desktop" type="text" class="btn search"
		placeholder="Cerca nel sito"
		use:clickOutside onclick_outside={() => handleClickOutside()}
		bind:value={search}
		onclick={() => {searchActive = true}}
		in:slide|global={{ axis: "x", duration: 200 }}
		out:slide|global={{ axis: "x", duration: 200 }}
		>
		{#if searchActive}
			<button id="search-btn-desktop" class="btn ronzino-12 uppercase" onclick={() => {searchActive = false; search = ""}}
			in:slide|global={{ axis: "x", duration: 200 }}
			out:slide|global={{ axis: "x", duration: 200 }}
			>× Chiudi</button>
		{/if}
	</div>
		<!-- {#if $page.url.pathname === "/" || $page.url.pathname !== "/" && tagger.open} -->
		 	<div id="more-tags-mobile" class="tag ronzino-12 uppercase shadow">
				{#if !tagger.open}
					<button class="btn" onclick={() => {!tagger.open ? openTagger() : closeTagger()}}
					in:slide|global={{ axis: "x", duration: 200, delay: 50 }}
					out:slide|global={{ axis: "x", duration: 200, delay: 0 }}
					>...</button>
				{:else}
					<button class="btn" onclick={() => {!tagger.open ? openTagger() : closeTagger()}}
					in:slide|global={{ axis: "x", duration: 200, delay: 50 }}
					out:slide|global={{ axis: "x", duration: 200, delay: 0 }}
					>× Chiudi</button>
				{/if}
			</div>
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
				<div class="tag shadow"
				animate:flipVertical
				class:active={data.searchParams.includes(tag.slug.current)}
				style="--delay: {i*50}ms"
				>
					{#if tagger.open || i<tagger.maxTags}
						<button onclick={() => toggleTag(tag.slug.current)}
						in:slide|global={{ axis: "x", duration: 200, delay: 30 + i*30 }}
						out:slide|global={{ axis: "x", duration: 200, delay: 500 + (tagger.tags.length)*30 - i*30 }}
						>
							<span class="prefix">×</span>{tag.title}
						</button>
					{/if}
				</div>
			{/each}
		<!-- {/if} -->
			<div id="more-tags-desktop" class="tag ronzino-12 uppercase shadow">
				{#if !tagger.open}
					<button class="btn" onclick={() => {!tagger.open ? openTagger() : closeTagger()}}
					in:slide|global={{ axis: "x", duration: 200, delay: 200 + (tagger.maxTags+1)*30 }}
					out:slide|global={{ axis: "x", duration: 0, delay: 0 }}
					>...</button>
				{:else}
					<button class="btn" onclick={() => {!tagger.open ? openTagger() : closeTagger()}}
					in:slide|global={{ axis: "x", duration: 200, delay: 200 + (tagger.maxTags+1)*30 }}
					out:slide|global={{ axis: "x", duration: 0, delay: 0 }}
					>× Chiudi</button>
				{/if}
			</div>
	</div>
{/if}

<!-- Main -->
{#if domLoaded}
	<div class="site-wrapper" style="background-color: {bger.bg};">
		{#key data.pathname}
			<main
			in:blur|global={{ duration: 200, delay: 500 }}
			out:blur|global={{ duration: 200, delay: 0 }}
			>
				{@render children()}
			</main>
		{/key}
		{#if ($page.url.pathname === '/' && data.searchParams.length > 0) || ($page.url.pathname !== '/' && $page.url.pathname !== '/map')}
			<footer class="ronzino-12 uppercase medium">
				<div>
					{#if data.info.email}<a href="mailto:{data.info.email}">{data.info.email}</a>{/if}
					{#if data.info.adressLabel}
						{#if data.info.adressGoogleMaps}
							<a href={data.info.adressGoogleMaps} target="_blank" rel="noopener noreferrer">{data.info.adressLabel}</a>
						{:else}
							<p>{data.info.adressLabel}</p>
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
	</div>
{/if}



<style>
.site-wrapper {
	transition: var(--transition);
}
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
	filter: blur(10px);
}
@media screen and (max-width: 700px) {
	.menu {
		top: calc(var(--gutter)*1.4);
		transform: unset;
		flex-direction: column;
		gap: 2rem;
	}
	.menu.blurred:not(:hover) .menu-item a {
		color: unset;
		filter: unset;
	}
	.menu-bg {
		content: '';
		background-color: var(--white);
		height: 100vh;
		width: 100%;
		position: fixed;
		top: 0;
		z-index: 8;
	}
	.menu-item {
		display: none;
	}
	.menu-item.visible {
		display: block;
	}
}

/* UI desktop */
#search-bar-desktop {
	display: flex;
	gap: .3rem;
	align-items: center;
	width: 100%;
	margin-bottom: .3rem;
}
.search {
	outline: none;
	border: none;
}
.search::placeholder {
	color: var(--darkGray);
}
.search:focus {
	color: var(--black);
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
#more-tags-mobile {
	display: none;
}
#coordinates-desktop {
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
#coordinates-desktop.off {
	width: 0;
	padding: 0;
}
#coordinates-desktop .cta {
	opacity: 0;
	width: 0;
	color: var(--black);
}
#coordinates-desktop:hover span {
	opacity: 0;
	width: 0;
}
#coordinates-desktop:hover .cta {
	opacity: 1;
	width: auto;
}
#zoom {
	position: fixed;
	top: calc(var(--gutter)*1.4);
	right: var(--gutter);
	display: flex;
	justify-content: flex-end;
	gap: .3rem;
	z-index: 1;
	transition: var(--transition);
	transition-delay: 500ms;
}
#zoom.extra {
	right: calc(4vw + var(--gutter));
}
#zoom svg {
	stroke: var(--darkGray);
}
#zoom button:hover svg {
	stroke: var(--black);
}
#zoom button.off {
	cursor: default;
}
#zoom button.off svg {
	stroke: var(--lightGray);
}
/* UI mobile */
nav[aria-label="ui-mobile"] {
	display: none;
}
@media screen and (max-width: 700px) {
	nav[aria-label="ui-desktop"] {
		display: none;
	}
	nav[aria-label="ui-mobile"] {
		display: flex;
		position: fixed;
		padding: 0 var(--gutter) calc(var(--gutter)*1.4);
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 11;
		gap: .2rem;
	}
	nav[aria-label="ui-mobile"] .btn {
		justify-content: center;
	}
	#search-bar-desktop {
		display: none;
	}
	#search-btn-mobile {
		flex-basis: 20%;
	}
	#search-mobile {
		flex-basis: 80%;
	}
	#more-tags-desktop {
		display: none;
	}
	#more-tags-mobile {
		display: flex;
		position: fixed;
		bottom: calc(var(--gutter)*2.8 + 2rem);
		z-index: 11;
	}
	.tags {
		top: unset;
		padding-bottom: calc(var(--gutter)*2.8 + 4.3rem);
		right: 0;
		bottom: 0;
		flex-direction: column-reverse;
		align-items: flex-end;
	}
	#coordinates-mobile {
		flex-basis: 60%;
	}
	#menuSwitch {
		flex-basis: 20%;
	}
}

/* Main */
main {
	min-height: calc(100vh - .857rem*1.166*3 - var(--gutter)*12.8);
	min-height: 100vh;
	overflow: hidden;
}

/* Footer */
footer {
	display: flex;
	align-items: flex-start;
	gap: var(--gutter);
	padding: calc(var(--gutter)*11.4) var(--gutter) calc(var(--gutter)*1.4);
}
footer div {
	display: flex;
	flex-direction: column;
}
@media screen and (max-width: 700px) {
	footer {
		flex-direction: column;
		align-items: flex-start;
		padding-top: calc(var(--gutter)*21.4);
		padding-bottom: calc(var(--gutter)*2.8 + 2rem);
	}
	footer div {
		display: flex;
		flex-direction: column;
	}
}
</style>