export const prerender = false

/** @param {{ url: URL }} event */
export function GET({ url }) {
	const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${url.origin}/sitemap.xml
`

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
