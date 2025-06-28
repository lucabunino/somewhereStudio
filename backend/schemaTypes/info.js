import {InfoFilledIcon} from '@sanity/icons'
import {EmptyIcon} from '@sanity/icons'

export default {
	name: 'info',
	type: 'document',
	icon: InfoFilledIcon,
	fieldsets: [
		{ name: 'adress' },
	],
	fields: [
		{
			name: 'title',
			type: 'string',
			hidden: false,
		},
		{
			name: 'ragioneSociale',
			type: 'string',
		},
		{
			name: 'email',
			type: 'string',
		},
		{
			name: 'adressLabel',
			title: 'Label',
			type: 'text',
			rows: 2,
			fieldset: 'adress',
		},
		{
			name: 'adressGoogleMaps',
			title: 'GoogleMaps',
			type: 'url',
			fieldset: 'adress',
		},
		{
			name: 'adressLatitude',
			title: 'Latitude',
			type: 'number',
			fieldset: 'adress',
		},
		{
			name: 'adressLongitude',
			title: 'Longitude',
			type: 'number',
			fieldset: 'adress',
		},
		{
			name: 'socials',
			type: 'array',
			of: [
				{
					name: 'social',
					type: 'object',
					icon: EmptyIcon,
					options: { columns: 2,},
					fields: [
						{
							name: 'label',
							type: 'string'
						},
						{
							name: 'link',
							type: 'url'
						},
					]
				},
			]
		},
		{
			name: 'pIva',
			title: 'P. IVA',
			type: 'string',
		},
		{
			name: 'ccia',
			title: 'CIIA',
			type: 'string',
		},
		{
			name: 'capitaleSociale',
			type: 'string',
		},
	],
};