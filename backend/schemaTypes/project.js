import media from './objects/media';
import {SquareIcon, TextIcon, VideoIcon, ImageIcon} from '@sanity/icons'

export default {
	name: 'project',
	type: 'document',
	icon: SquareIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
		},
		{
			name: 'slug',
			type: 'slug',
			validation: (Rule) => Rule.required(),
			options: {
				source: 'title',
				maxLength: 96,
			},
		},
		{
			name: 'date',
			type: 'date',
		},
		{
			name: 'index',
			title: 'Display in index',
			type: 'boolean',
			initialValue: true,
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'singlePage',
			title: 'Display in single page',
			type: 'boolean',
			initialValue: true,
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'SEODescription',
			type: 'text',
			rows: 5,
			validation: Rule => Rule.max(160).warning('SEO Description should be 160 characters or fewer')
		},
		{
			name: 'color',
			type: 'color',
			options: {
				disableAlpha: true
			},
		},
		{
			name: 'tags',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'tag' }] }],
		},
		{
			name: 'formats',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'format' }] }],
		},
		{
			name: 'locations',
			type: 'array',
			of: [
				{
					name: 'client',
					type: 'reference',
					to: [{ type: 'location' }],
					validation: (Rule) => Rule.required(),
				},
			],
		},
		{
			name: 'clients',
			type: 'array',
			of: [
				{
					name: 'client',
					type: 'reference',
					to: [{ type: 'company' }],
					validation: (Rule) => Rule.required(),
				},
			],
		},
		{
			name: 'collaborations',
			type: 'array',
			of: [
				{
					name: 'collaboration',
					type: 'reference',
					to: [{ type: 'company' }],
					validation: (Rule) => Rule.required(),
				},
			],
		},
		{
			name: 'cover',
			type: 'image',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'modules',
			type: 'array',
			of: [
				{
					name: 'module',
					type: 'reference',
					to: [{ type: 'module' }, { type: 'serie' }],
					validation: (Rule) => Rule.required(),
				},
			],
		},
		{
			name: 'extra',
			type: 'array',
			of: [
				{
					type: 'image',
					icon: ImageIcon,
					fields: [
						{
							name: 'caption',
							type: 'string',
						},
						{
							name: 'altText',
							type: 'string',
						}
					],
				},
				{
					name: 'extraText',
					title: 'Text',
					type: 'object',
					icon: TextIcon,
					fields: [{name: 'text', type: 'text', rows: 4,}]
				}
			],
		},
	],
	preview: {
		select: {
			title: 'title',
			index: 'index',
			singlePage: 'singlePage',
			cover: 'cover',
		},
		prepare({ title, index, singlePage, cover }) {
			const suffixes = []
			if (index === false) suffixes.push('no index')
			if (singlePage === false) suffixes.push('no single page')
			const suffix = suffixes.length > 0 ? ` (${suffixes.join(', ')})` : ''
			return {
				title: `${title ?? 'Untitled'}${suffix}`,
				media: cover,
			}
		},
	}
};