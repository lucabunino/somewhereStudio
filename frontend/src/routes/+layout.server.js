import { getTags, getInfo, getSeo } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	const tags = await getTags();
	const info = await getInfo();
	const seo = await getSeo();
	const { pathname } = url
	const searchParams = url.searchParams.getAll('tag');
	if (tags, info, seo, pathname, searchParams) {
		return {
			tags,
			info,
			seo,
			pathname,
			searchParams
		};
	}
	throw error(404, 'Not found');
}