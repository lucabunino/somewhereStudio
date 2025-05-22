import {TagIcon} from '@sanity/icons'

export default {
	name: 'tag',
	type: 'document',
	icon: TagIcon,
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
			name: 'hierarchy',
			type: 'number',
			initialValue: 1,
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'hidden',
			title: 'Hidden in homepage',
			type: 'boolean',
			initialValue: false,
			validation: (Rule) => Rule.required(),
		},
	],
};