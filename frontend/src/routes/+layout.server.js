import { getTags, getInfo, getSeo, getPolicies } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url, setHeaders }) {
	const [tags, info, seo, policies] = await Promise.all([getTags(), getInfo(), getSeo(), getPolicies()]);
	const { pathname } = url
	const searchTags = url.searchParams.getAll('tag');
	const searchString = url.searchParams.get('search');
	if (tags, info, seo, pathname, policies) {
		// cache at the edge for 60s, serve stale up to 10min while revalidating
		setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' });
		return {
			tags,
			info,
			seo,
			pathname,
			searchTags,
			searchString,
			policies
		};
	}
	throw error(404, 'Not found');
}
