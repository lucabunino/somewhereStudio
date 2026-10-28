import { getIndex } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load() {
	const index = await getIndex();
	if (index) {
		return {
			index,
			seoSingle: { seoTitle: 'Index' },
		};
	}
	throw error(404, 'Not found');
}
