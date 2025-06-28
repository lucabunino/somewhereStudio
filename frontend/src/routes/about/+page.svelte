<script>
import { slide } from 'svelte/transition';


// Variables
let { data } = $props()
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

$effect(() => {
	domLoaded = true
	tagger.setMaxTags(0)
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section id="about" class="gaisyr-34">
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
					<p class="gaisyr-19">{person.bio}</p>
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
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 100vw;
	padding: calc(var(--gutter) + .2rem) var(--gutter) 0;
}
.about, .clients {
	margin-left: 30vw;
	text-indent: calc(-30vw + 14.2rem + var(--gutter));
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
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--gutter);
	padding: calc(var(--gutter)*12) 0;
}
.person h3 {
	margin-bottom: .3em;
}
</style>