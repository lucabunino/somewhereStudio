export async function GET() {
	return new Response(
		`
		User-agent: *
		Disallow: 
		Disallow: /cgi-bin/
		Sitemap: https://www.somewhere.works/sitemap.xml
		`.trim(),
	);
}