import { createClient } from '@sanity/client';
import { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } from '$env/static/public';

const module = `
...,
tags[]->{title, slug},
quotes[] {
	...,
	author->{title}
},
"project": {
	"title": coalesce(
		*[_type == "project" && references(^._id)][0].title,
		project->title,
	),
	"slug": coalesce(
		*[_type == "project" && references(^._id)][0].slug,
		project->slug,
	)
},
media[]{
	caption,
	mp4 {
		asset->{url}
	},
	cover{
		asset->{
			_ref, _id, _type, metadata {dimensions, lqip}
		},
	},
	asset->{
		_ref, _id, _type, metadata {dimensions, lqip}
	},
},
id,
hash,
latitude,
longitude,
location->{
	latitude,
	longitude
},
"latitude": coalesce(latitude, location->latitude),
"longitude": coalesce(longitude, location->longitude),
modules[]->{
	...,
	tags[]->{title, slug},
	project->{title, slug},
	media[]{
		caption,
		mp4 {
			asset->{url}
		},
		cover{
			asset->{
				_ref, _id, _type, metadata {dimensions, lqip}
			},
		},
		asset->{
			_ref, _id, _type, metadata {dimensions, lqip}
		},
	},
	id,
	hash,
	latitude,
	longitude,
	location->{
		latitude,
		longitude
	},
	"latitude": coalesce(latitude, location->latitude),
	"longitude": coalesce(longitude, location->longitude),
}
`

if (!PUBLIC_SANITY_PROJECT_ID || !PUBLIC_SANITY_DATASET) {
	throw new Error('Did you forget to run sanity init --env?');
}

export const client = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	useCdn: false, // `false` if you want to ensure fresh data
	apiVersion: '2025-04-23', // date of setup
});

export async function getSeo() {
	return await client.fetch(`
		*[_type == "seo"][0] {
			SEOTitle,
			SEODescription,
			SEOKeywords,
			SEOImage,
		}`
	);
}
export async function getInfo() {
	return await client.fetch(`
		*[_type == "info"][0] {
			...,
		}`
	);
}
export async function getPolicies() {
	return await client.fetch(`
		*[_type == "policy" && !(_id in path('drafts.**'))] {
			...,
		}`
	);
}
export async function getPolicy(slug) {
	return await client.fetch(`
		*[_type == "policy" && kind == $slug && !(_id in path('drafts.**'))][0] {
			...,
		}`, { slug });
}
// export async function getModules(tags, search) {
// 	if (tags.length > 0) {
// 		return await client.fetch(`
// 			*[_type in ["module", "serie"]
// 			&& search == true
// 			${tags?.length ? `&& count(tags[@->slug.current in $tags]) > 0` : ''}
// 			&& !(_id in path('drafts.**'))] {
// 				${module}
// 			}|order(hierarchy desc)`, { tags });
// 	} else if (search) {
// 		return await client.fetch(`
// 			*[_type == "module"
// 			&& search == true
// 			&& (
// 				title match $search ||
// 				project->title match $search ||
// 				tags[]->title match $search ||
// 				text1[].children[].text match $search ||
// 				text2[].children[].text match $search ||
// 				quotes[].quotation match $search
// 			)
// 			&& !(_id in path('drafts.**'))
// 			] | score(
// 			boost(title match $search, 4)
// 			) | order(_score desc) {
// 			${module},
// 			_score
// 			}
// 			`, { search: `${search}*` });
// 	} else {
// 		return await client.fetch(`
// 			*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->{
// 				${module}
// 			}`
// 		);
// 	}
// }
export async function getModules(tags, search) {
	const hasTags = tags?.length > 0;
	const hasSearch = !!search;

	if (hasTags || hasSearch) {
		// Build query parts
		let filters = [
			'_type in ["module", "serie"]',
			'search == true',
			'!(_id in path("drafts.**"))'
		];

		if (hasTags) {
			filters.push('count(tags[@->slug.current in $tags]) > 0');
		}

		if (hasSearch) {
			filters.push(`(
				title match $search ||
				project->title match $search ||
				tags[]->title match $search ||
				text1[].children[].text match $search ||
				text2[].children[].text match $search ||
				quotes[].quotation match $search
			)`);
		}

		const query = `
			*[${filters.join(' && ')}]
			${hasSearch ? `| score(boost(title match $search, 4)) | order(_score desc)` : `| order(hierarchy desc)`} {
				${module}
				${hasSearch ? `, _score` : ''}
			}
		`;

		// Prepare params object safely
		const params = {};
		if (hasTags) params.tags = tags;
		if (hasSearch) params.search = `${search}*`;

		return await client.fetch(query, params);
	}

	// Default: homepage modules
	return await client.fetch(`
		*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->{
			${module}
		}
	`);
}
export async function getMapModules(tags) {
	return await client.fetch(`
		*[_type in ["module", "serie"]
		&& search == true
		&& (
			(defined(longitude) && defined(latitude)) ||
			(defined(location->longitude) && defined(location->latitude))
		)
		${tags?.length ? `&& count(tags[@->slug.current in $tags]) > 0` : ''}
		&& !(_id in path('drafts.**'))] {
			${module}
		}|order(hierarchy desc)`, { tags });
}
// export async function getTags() {
// 	return await client.fetch(`
// 		*[_type == "tag" && !(_id in path('drafts.**'))] {
// 			...,
// 			"homepage": count(*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->tags[@->_id == ^._id]) > 0
// 		}|order(hierarchy desc, title asc)`
// 	);
// }
export async function getTags() {
	return await client.fetch(`
		*[_type == "tag" && !(_id in path('drafts.**')) 
		  && count(*[_type in ["module", "serie"] 
		             && !(_id in path('drafts.**')) 
		             && references(^._id)]) > 0] 
		{
			...,
			"homepage": count(*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->tags[@->_id == ^._id]) > 0
		}
		| order(hierarchy desc, title asc)
	`);
}
export async function getAbout() {
	return await client.fetch(`
		*[_type == "about" && !(_id in path('drafts.**'))][0] {
			...,
			people[]->{
				name,
				surname,
				bio
			}
		}`
	);
}
export async function getIndex() {
	return await client.fetch(`
		*[_type == "project" && index == true && !(_id in path('drafts.**'))]|order(date desc) {
			...,
			collaborations[]->{
				title,
			},
			clients[]->{
				title,
			},
			tags[]|order(hierarchy desc, title asc)->{
				title, slug, hierarchy
			},
			formats[]->{
				title,
			},
			locations[]->{
				title,
				latitude,
				longitude,
			}
		}`
	);
}
export async function getProject(slug) {
	return await client.fetch(`
		*[_type == "project" && slug.current == $slug] {
			...,
			modules[]->{
				${module}
			},
			collaborations[]->{
				title,
			},
			clients[]->{
				title,
			},
			tags[]|order(hierarchy desc, title asc)->{
				title, slug, hierarchy
			},
			formats[]->{
				title,
			},
			locations[]->{
				title,
			},
		}`, { slug });
}