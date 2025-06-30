import {MarkerIcon} from '@sanity/icons'

export default {
	name: 'location',
	type: 'document',
	icon: MarkerIcon,
	fieldsets: [
		{ name: 'coordinates' },
	],
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
			name: 'latitude',
			type: 'number',
			fieldset: 'coordinates',
		},
		{
			name: 'longitude',
			type: 'number',
			fieldset: 'coordinates',
		},
	],
};