import { getSitemapEntries } from '$lib/utils/sanity';

export const prerender = false

const STATIC_ROUTES = ['/', '/index', '/map', '/about']

// <loc> must be a percent-encoded URL (e.g. "libertà" → "libert%C3%A0"), XML-escaped
/** @param {string} url */
function toLoc(url) {
	return encodeURI(url)
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

/** @param {{ url: URL }} event */
export async function GET({ url }) {
	const { projects, policies } = await getSitemapEntries()

	/** @type {{loc: string, lastmod?: string}[]} */
	const entries = [
		...STATIC_ROUTES.map((path) => ({ loc: url.origin + path })),
		...projects.map((/** @type {any} */ p) => ({ loc: `${url.origin}/index/${p.slug}`, lastmod: p._updatedAt })),
		...policies.map((/** @type {any} */ p) => ({ loc: `${url.origin}/${p.kind}`, lastmod: p._updatedAt })),
	]

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `	<url>
		<loc>${toLoc(entry.loc)}</loc>${entry.lastmod ? `\n		<lastmod>${entry.lastmod.slice(0, 10)}</lastmod>` : ''}
	</url>`
	)
	.join('\n')}
</urlset>
`

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 's-maxage=3600' }
	})
}
