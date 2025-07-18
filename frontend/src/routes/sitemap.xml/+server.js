import { getIndex } from '$lib/utils/sanity';
import { urlFor } from '$lib/utils/image';
let baseUrl = "https://www.somewhere.works"

export async function GET() {
  const index = await getIndex();
  const indexSlugsXML = index.map(index => {
	let imgSrc = index.cover.asset ? urlFor(index.cover.asset).url() : "";
    return `
      <url>
        <loc>${baseUrl}/index/${index.slug.current}</loc>
        <lastmod>${index._updatedAt}</lastmod>
        <priority>0.80</priority>
        <image:image>
          <image:loc>${imgSrc}</image:loc>
        </image:image>
      </url>`;
  }).join('');

  // Build the complete sitemap
  return new Response(
    `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
    >
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.00</priority>
      </url>
      <url>
        <loc>${baseUrl}/map</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.80</priority>
      </url>
	  <url>
        <loc>${baseUrl}/index</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.80</priority>
      </url>
	  ${indexSlugsXML}
	  <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.80</priority>
      </url>
    </urlset>`.trim(),
    {
		headers: {
		'Content-Type': 'application/xml',
		'Cache-Control': 's-maxage=3600'
		}
    }
  );
}
