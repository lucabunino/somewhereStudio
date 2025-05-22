<script>
import { slide } from 'svelte/transition';

// Imports


// Variables
let { data } = $props()
$inspect(data)
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
tagger.setTags([])

$effect(() => {
	domLoaded = true
})
</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<section id="about" class="gaisyr-34">
	{#if data.about.about}
		<p class="about">{data.about.about}</p>
	{/if}
	{#if domLoaded}
		<div class="contacts">
			{#if data.info.email}
				<div class="btn gaisyr-14">
					<a class="btn-link" href="mailto:{data.info.email}"
					in:slide|global={{ axis: "x", duration: 500 }}
					>{data.info.email}</a>
				</div>
			{/if}
			{#each data.info.socials ?? [] as social, i}
				<div class="btn gaisyr-14">
					<a class="btn-link" href={social.link} target="_blank" rel="noopener noreferrer"
					in:slide|global={{ axis: "x", duration: 500, delay: i*30 }}
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
	padding: calc(var(--gutter)*5.3) var(--gutter) 0;
}
.about, .clients {
	margin-left: 30vw;
	text-indent: -30vw;
}
.contacts {
	margin-top: .5em;
	margin-left: 30vw;
	display: block;
}
.contacts .btn {
	margin-bottom: .3rem;
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