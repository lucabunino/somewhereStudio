import { getProject } from '$lib/utils/sanity';
import { error } from '@sveltejs/kit';

// Fallback description from project data, so pages without SEODescription don't all share the site one
function describe(project) {
	const year = project.date ? new Date(project.date).getFullYear() : null;
	const places = project.locations?.map((l) => l.title).filter(Boolean).join(', ');
	const clients = project.clients?.map((c) => c.title).filter(Boolean).join(', ');
	const collaborations = project.collaborations?.map((c) => c.title).filter(Boolean).join(', ');
	const parts = [
		[project.title, year].filter(Boolean).join(', '),
		places,
		clients && `Per ${clients}`,
		collaborations && `In collaborazione con ${collaborations}`,
	].filter(Boolean);
	return parts.join('. ') + '.';
}

export async function load({ params }) {
		const project = await getProject(params.slug);
		if (project?.length) {
				const p = project[0];
				return {
						project,
						hidden: !p.singlePage,
						seoSingle: {
							seoTitle: p.title,
							seoDescription: p.SEODescription || describe(p),
							seoImage: p.cover,
						},
				};
		}
		throw error(404, 'Not found');
}
