<!-- PortableTextStyle -->
<script lang="ts">
import type {BlockComponentProps} from '@portabletext/svelte'

interface Props {
	portableText: BlockComponentProps;
	children?: import('svelte').Snippet;
}

let { portableText, children }: Props = $props();
let {global, value} = $derived(portableText)
let {style, listItem, markDefs} = $derived(value);
</script>

{#if value._type === 'link'}
	<span class="link"><a href={value?.url} target={value?.blank ? '_blank' : undefined}>
	{@render children()}{#if value?.blank}<sup>{@html ' ↗'}</sup>{/if}
	</a></span>
{:else if style === 'normal' && !listItem}
	<p class="paragraph">{@render children()}</p>
{:else if style === 'normalReading' && !listItem}
	<p class="paragraph gaisyr-19">{@render children()}</p>
{:else if listItem == 'bullet'}
	<li>{@render children()}</li>
{:else if style=== 'h3'}
	<h3 class="gaisyr-19">{@render children()}</h3>
{/if}

<style>
.link {
	text-decoration: underline;
	cursor: pointer;
}
.link:hover {
	color: var(--darkGray);
}
.paragraph {
	margin: 0;
}
h3 {
	margin-top: 2em;
	margin-bottom: .2em;
	margin-left: 18rem;
	text-indent: -18rem;
}
:global(ul:not(.menu)) {
	-webkit-padding-start: 0;
	        padding-inline-start: 0;
	margin: .5em 0;
}
li {
	padding: 0;
	text-indent: 0;
	list-style-type: "— ";
}
</style>