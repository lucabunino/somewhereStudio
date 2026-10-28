import { getPolicy } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const policy = await getPolicy(params.slug);
	if (policy) {
		return {
			policy,
			seoSingle: { seoTitle: policy.title },
		};
	}
	throw error(404, 'Not found');
}
