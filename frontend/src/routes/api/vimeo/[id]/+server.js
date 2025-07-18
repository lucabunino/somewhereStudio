import { env } from '$env/dynamic/private';

export async function GET({ params }) {
	if (!env.VIMEO_TOKEN) {
		return new Response(JSON.stringify({ error: "Missing Vimeo token" }), {
			status: 500
		});
	}

	const res = await fetch(`https://api.vimeo.com/videos/${params.id}`, {
		headers: {
			Authorization: `Bearer ${env.VIMEO_TOKEN}`
		}
	});

	if (!res.ok) {
		return new Response(JSON.stringify({ error: "Failed to fetch from Vimeo" }), {
			status: res.status
		});
	}

	const data = await res.json();
	const embedRaw = data.embed?.html?.match(/src="([^"]+)"/)?.[1] ?? `https://player.vimeo.com/video/${params.id}`
	const embedUrl = `${embedRaw}${embedRaw.includes('?') ? '&' : '?'}autoplay=1&muted=0&loop=1&title=0&byline=0&portrait=0&dnt=1`;

	return new Response(JSON.stringify({
		thumbnail: data.pictures?.sizes?.at(-1)?.link,
		width: data.width,
		height: data.height,
		embed: embedUrl,
	}));
}
