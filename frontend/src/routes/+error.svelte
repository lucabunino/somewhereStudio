<script>
import { page } from '$app/stores';
import { onDestroy, onMount } from 'svelte';

import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

onMount(() => {
	header.setBlurred(true);
	tagger.setMaxTags(0)
});

onDestroy(() => {
	tagger.setMaxTags(tagger.firstMaxTags)
});
</script>

<div>
	<h1 class="gaisyr-34">{$page.status}: {$page.error.message}</h1>
	<a href="/" class="btn shadow">← Go to homepage</a>
</div>

<style>
div {
	position: relative;
	padding: 6rem var(--gutter);
}
a {
	display: block;
	margin-top: 1rem;
}
</style>