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
	cover {
		asset->{
			_ref, _id, _type
		},
	},
	asset->{
		_ref, _id, _type, metadata {dimensions}
	},
},
modules[]->{
	...,
	tags[]->{title, slug},
	project->{title, slug},
	media[]{
		caption,
		mp4 {
			asset->{url}
		},
		cover {
			asset->{
				_ref, _id, _type
			},
		},
		asset->{
			_ref, _id, _type, metadata {dimensions}
		},
	},
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
// Archive
export async function getModules(tags) {
	if (tags.length > 0) {
		return await client.fetch(`
			*[_type in ["module", "serie"]
			&& search == true
			${tags?.length ? `&& count(tags[@->slug.current in $tags]) > 0` : ''}
			&& !(_id in path('drafts.**'))] {
				${module}
			}|order(hierarchy desc)`, { tags });
	} else {
		return await client.fetch(`
			*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->{
				${module}
			}`
		);
	}
}
export async function getTags() {
	return await client.fetch(`
		*[_type == "tag" && !(_id in path('drafts.**'))] {
			...,
			"homepage": count(*[_type == "homepage" && !(_id in path('drafts.**'))][0].modules[]->tags[@->_id == ^._id]) > 0
		}|order(hierarchy desc, title asc)`
	);
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
			tags[]->{
				title, slug, hierarchy
			},
			formats[]->{
				title,
			},
			locations[]->{
				title,
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
			tags[]->{
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







// OLD


export async function getProjects() {
	return await client.fetch(
		`
		*[_type == "homepage" && !(_id in path('drafts.**'))][0].projects[] {
			video {
				mp4 {
					asset-> {url}
				},
				cover {
					asset {
						_ref, _id, _type
					},
					"info": asset->{
						title, description, altText, metadata {dimensions}
					},
				},
			},
			desktop {
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			mobile {
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			reference->{
				_type,
				title,
				slug,
				tags[]->{title},
			},
		}
		`
	);
}
export async function getStudio() {
	return await client.fetch(
		`
		*[_type == "studio" && !(_id in path('drafts.**'))][0] {
			...,
			body[] {
				...,
				markDefs[] {
					...,
					image {
						asset {
							_ref, _id, _type
						},
						"info": asset->{
							title, description, altText, metadata {dimensions}
						},
					}
				}
			}
		}
		`
	);
}
export async function getWorks() {
	return await client.fetch(
		`
		*[_type == "work" && !(_id in path('drafts.**'))]|order(date) {
			...,
			media[] {
				mp4 {
					asset-> {url}
				},
				cover {
					asset {
						_ref, _id, _type
					},
					"info": asset->{
						title, description, altText, metadata {dimensions}
					},
				},
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			tags[]->{title, slug, colour}
		}
		`
	);
}
export async function getWork(slug) {
	return await client.fetch(
		`
		*[_type == "work" && slug.current == $slug] {
			slug,
			title,
			description,
			media[] {
				mp4 {
					asset-> {url}
				},
				cover {
					asset {
						_ref, _id, _type
					},
					"info": asset->{
						title, description, altText, metadata {dimensions}
					},
				},
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			tags[]->{title},
			orderRank,
			"prev": *[_type == "work" && orderRank < ^.orderRank] | order(orderRank desc)[0] { title, slug, media[] {type} },
			"next": *[_type == "work" && orderRank > ^.orderRank] | order(orderRank asc)[0] { title, slug }
		}
		`, { slug });
}
export async function getWorkIndexes() {
	return await client.fetch(
		`
		*[_type == "work" && !(_id in path('drafts.**'))]|order(orderRank) {
			slug,
			media[] {
				_key,
			},
		}
		`
	);
}
export async function getPersonals() {
	return await client.fetch(
		`
		*[_type == "personal" && !(_id in path('drafts.**'))]|order(orderRank) {
			...,
			media[] {
				video {
					mp4 {
						asset-> {url}
					},
					cover {
						asset {
							_ref, _id, _type
						},
						"info": asset->{
							title, description, altText, metadata {dimensions}
						},
					},
				},
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			tags[]->{title}
		}
		`
	);
}
export async function getPersonal(slug) {
	return await client.fetch(
		`
		*[_type == "personal" && slug.current == $slug] {
			slug,
			title,
			description,
			media[] {
				mp4 {
					asset-> {url}
				},
				cover {
					asset {
						_ref, _id, _type
					},
					"info": asset->{
						title, description, altText, metadata {dimensions}
					},
				},
				asset {
					_ref, _id, _type
				},
				"info": asset->{
					title, description, altText, metadata {dimensions}
				},
			},
			tags[]->{title},
			moreInfo,
			orderRank,
			"prev": *[_type == "personal" && orderRank < ^.orderRank] | order(orderRank desc)[0] { title, slug, media[] {type} },
			"next": *[_type == "personal" && orderRank > ^.orderRank] | order(orderRank asc)[0] { title, slug }
		}
		`, { slug });
}
export async function getPersonalIndexes() {
	return await client.fetch(
		`
		*[_type == "personal" && !(_id in path('drafts.**'))]|order(orderRank) {
			slug,
			media[] {
				_key,
			},
		}
		`
	);
}