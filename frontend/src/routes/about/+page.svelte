<script>
import { slide } from 'svelte/transition';
import { onMount } from "svelte";

// Variables
let { data } = $props()
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)

import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

onMount(() => {
	header.setBlurred(true)
})

$effect(() => {
	domLoaded = true
	tagger.setMaxTags(0)
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section id="about" class="gaisyr-34 mobile-gaisyr-16">
	{#if data.about.about}
		<p class="about">{data.about.about}</p>
	{/if}
	{#if domLoaded}
		<div class="contacts ronzino-12 uppercase">
			{#if data.info.email}
				<div class="tag">
					<a class="btn" href="mailto:{data.info.email}"
					in:slide|global={{ axis: "x", duration: 500, delay: 500 }}
					>{data.info.email}</a>
				</div>
			{/if}
			{#each data.info.socials ?? [] as social, i}
				<div class="tag">
					<a class="btn" href={social.link} target="_blank" rel="noopener noreferrer"
					in:slide|global={{ axis: "x", duration: 500, delay: 500 + i*100 }}
					>{social.label}</a>
				</div>
			{/each}
		</div>
	{/if}
	{#if data.about.people}
		<div class="people">
			{#each data.about.people as person}
			<div class="person">
				<h3>{person.name} {person.surname}</h3>
				{#if person.bio}
					<p class="gaisyr-19 mobile-gaisyr-11">{person.bio}</p>
				{/if}
			</div>
			{/each}
		</div>
	{/if}
	{#if data.about.clients}
		<p class="clients">{data.about.clients}</p>
	{/if}
</section>

<style>
#about {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
	-webkit-box-align: start;
	    -ms-flex-align: start;
	        align-items: flex-start;
	width: 100vw;
	padding: calc(var(--gutter) + .2rem) var(--gutter) 0;
}
.about {
	margin-left: 30vw;
	text-indent: calc(-30vw + 14.2rem + var(--gutter));
}
.clients {
	text-indent: 0;
	margin-left: 0;
}
.contacts {
	margin-top: .5em;
	margin-left: 30vw;
	display: block;
}
.contacts .btn {
	margin-bottom: .3rem;
	color: var(--darkGray);
	text-decoration: none;
}
.contacts .btn:hover {
	color: var(--black);
}
.people {
	display: -ms-grid;
	display: grid;
	-ms-grid-columns: 1fr var(--gutter) 1fr;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--gutter);
	padding: 6rem 0;
	width: 100%;
}
.person {
	max-width: 800px;
}
.person h3 {
	margin-bottom: .3em;
}
@media screen and (max-width: 1100px) {
	.about {
		margin-top: 6rem;
		margin-left: 0;
		text-indent: 0;
	}
	.contacts {
		margin-left: 0;
	}
}
@media screen and (max-width: 900px) {
	.people {
		-ms-grid-columns: 1fr;
		grid-template-columns: repeat(1, 1fr);
		gap: 6rem;
	}
	.person h3 {
		margin-bottom: 1.7rem;
	}
}
@media screen and (max-width: 700px) {
	#about {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		    -ms-flex-direction: column;
		        flex-direction: column;
		-webkit-box-align: start;
		    -ms-flex-align: start;
		        align-items: flex-start;
		width: 100vw;
		padding: calc(var(--gutter) + .2rem) var(--gutter) 0;
	}
}
</style>