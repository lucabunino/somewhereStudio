<script>
	import { page } from '$app/state'
	import { urlFor } from '$lib/utils/image.js'

	const seoBase = $derived(page.data?.seo)
	const seoSingle = $derived(page.data?.seoSingle)
	// No query string: ?tag= / ?search= variants all point to the same page
	const canonicalUrl = $derived(page.url.origin + page.url.pathname)
	const displayTitle = $derived(seoSingle?.seoTitle ? `${seoSingle.seoTitle} | ${seoBase?.seoTitle || ''}` : (seoBase?.seoTitle || ''))
	const rawDesc = $derived(seoSingle?.seoDescription || seoBase?.seoDescription || '')
	const displayDesc = $derived(rawDesc.length > 157 ? rawDesc.slice(0, 157) + '...' : rawDesc)

	/** @param {any} img */
	function resolveImageUrl(img) {
		if (!img) return undefined
		if (typeof img === 'string') return img
		if (img.asset) return urlFor(img)?.width(1200).height(630).fit('crop').quality(70).format('jpg').url()
		if (img.url) return img.url
		return undefined
	}
	const socialImageUrl = $derived(resolveImageUrl(seoSingle?.seoImage || seoBase?.seoImage))
</script>

<svelte:head>
	{#if displayTitle}
		<title>{displayTitle}</title>
		<meta name="title" content={displayTitle} />
		<meta property="og:title" content={displayTitle} />
		<meta name="twitter:title" content={displayTitle} />
		<meta property="og:site_name" content={seoBase?.seoTitle} />
	{/if}
	{#if displayDesc}
		<meta name="description" content={displayDesc} />
		<meta property="og:description" content={displayDesc} />
		<meta name="twitter:description" content={displayDesc} />
	{/if}
	{#if socialImageUrl}
		<meta property="og:image" content={socialImageUrl} />
		<meta property="og:image:secure_url" content={socialImageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:image" content={socialImageUrl} />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content="it_IT" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={canonicalUrl} />
	{#if page.data?.hidden}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}
</svelte:head>
