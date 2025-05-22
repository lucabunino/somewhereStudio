import {MarkerIcon} from '@sanity/icons'

export default {
	name: 'location',
	type: 'document',
	icon: MarkerIcon,
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
	],
};