import { getMapModules } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	const tags = url.searchParams.getAll('tag');
	const modules = await getMapModules(tags);
	if (modules) {
		return {
			modules,
		};
	}
	throw error(404, 'Not found');
}