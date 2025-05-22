import { getProject } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
		const project = await getProject(params.slug);
		if (project) {
				return {
						project
				};
		}
		throw error(404, 'Not found');
}