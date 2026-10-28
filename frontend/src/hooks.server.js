/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// one host only: apex → www, so Google doesn't see two copies of every page
	if (event.url.hostname === 'somewhere.works') {
		return Response.redirect(`https://www.somewhere.works${event.url.pathname}${event.url.search}`, 301);
	}

	const response = await resolve(event, {
		preload: ({ type, path }) => 
			['js', 'css', 'font'].includes(type) || path.includes('/important/')
	});

	return response;
}