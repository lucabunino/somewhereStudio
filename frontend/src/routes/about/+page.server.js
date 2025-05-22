import { getAbout } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load() {
	const about = await getAbout();
	if (about) {
		return {
			about,
		};
	}
	throw error(404, 'Not found');
}