import { getHomepageModules, getModules } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	// let modules = await getHomepageModules();
	const tags = url.searchParams.getAll('tag');
	const search = url.searchParams.get('search');
	const modules = await getModules(tags, search);
	// if (modulesQuery) {
	// 	modules = modulesQuery
	// }
	if (modules) {
		return {
			modules,
			// search results are thin, near-duplicate pages: keep them out of the index
			hidden: !!search,
		};
	}
	throw error(404, 'Not found');
}
