import { getTags, getInfo, getSeo } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	const tags = await getTags();
	const info = await getInfo();
	const seo = await getSeo();
	const { pathname } = url
	const searchTags = url.searchParams.getAll('tag');
	const searchString = url.searchParams.get('search');
	if (tags, info, seo, pathname) {
		return {
			tags,
			info,
			seo,
			pathname,
			searchTags,
			searchString
		};
	}
	throw error(404, 'Not found');
}