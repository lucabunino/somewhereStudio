import { getSeo, getSitemapEntries } from '$lib/utils/sanity';

export const prerender = false

// llms.txt (https://llmstxt.org): plain-text map of the site for AI assistants
/** @param {{ url: URL }} event */
export async function GET({ url }) {
	const [seo, { projects, policies }] = await Promise.all([getSeo(), getSitemapEntries()])

	const body = `# ${seo?.seoTitle || 'Somewhere Studio'}

> ${seo?.seoDescription || ''}

## Pages

- [Home](${url.origin}/): selected works
- [Index](${url.origin}/index): all projects
- [Map](${url.origin}/map): works on a map
- [About](${url.origin}/about): studio, people, clients

## Projects

${projects
	.map((/** @type {any} */ p) => `- [${p.title}](${url.origin}/index/${p.slug})${p.description ? `: ${p.description.replace(/\s+/g, ' ').trim()}` : ''}`)
	.join('\n')}

## Optional

${policies.map((/** @type {any} */ p) => `- [${p.title || p.kind}](${url.origin}/${p.kind})`).join('\n')}
- [Sitemap](${url.origin}/sitemap.xml)
`

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 's-maxage=3600' }
	})
}
