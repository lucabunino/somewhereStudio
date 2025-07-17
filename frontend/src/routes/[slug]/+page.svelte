<script>
import { onDestroy, onMount } from 'svelte';
import { PortableText } from '@portabletext/svelte'
import PolicyTextStyle from "$lib/components/portableTextStyles/PolicyTextStyle.svelte";

import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

// Variables
let { data } = $props()
$inspect(data)


onMount(() => {
	header.setBlurred(true);
	tagger.setMaxTags(0)
});

onDestroy(() => {
	tagger.setMaxTags(tagger.firstMaxTags)
});
</script>

<section id="policy">
	{#if data.policy.title}<h1 class="gaisyr-34 mobile-gaisyr-30">{data.policy.title}</h1>{/if}
	{#if data.policy.body}
		<div>
			<PortableText
			value={data.policy.body}
			components={{
			block: {
				normal: PolicyTextStyle,
				h3: PolicyTextStyle,
			},
			listItem: PolicyTextStyle,
			marks: {
				link: PolicyTextStyle,
			},
			}}/>
		</div>
	{/if}
</section>

<style>
#policy {
	padding: var(--gutter);
	max-width: 800px;
	padding-top: 6rem;
}
h1 {
	margin-bottom: 1rem;
}
@media screen and (max-width: 700px) {
	#policy {
		padding: calc(var(--gutter)*2.4) var(--gutter) 0;
	}
}
</style>