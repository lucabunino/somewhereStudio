import { getTags, getInfo, getSeo, getPolicies } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	const tags = await getTags();
	const info = await getInfo();
	const seo = await getSeo();
	const policies = await getPolicies();
	const { pathname } = url
	const searchTags = url.searchParams.getAll('tag');
	const searchString = url.searchParams.get('search');
	if (tags, info, seo, pathname, policies) {
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