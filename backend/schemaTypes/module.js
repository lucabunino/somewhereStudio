import media from './objects/media';
import {BlockElementIcon, BlockquoteIcon} from '@sanity/icons'

const kindList = [
	{title: 'Image', value: 'image'},
	{title: 'Slider', value: 'slider'},
	{title: 'Box', value: 'box'},
	{title: 'Vimeo', value: 'vimeo'},
	{title: 'Short Video', value: 'shortVideo'},
	{title: 'Composition', value: 'composition'},
	{title: 'Short text', value: 'shortText'},
	{title: 'Long text', value: 'longText'},
	{title: 'List', value: 'list'},
	{title: 'Quote', value: 'quote'},
];

function getKindTitle(kindValue) {
	const kind = kindList.find(item => item.value === kindValue);
	return kind ? kind.title : kindValue; // Fallback to the value if no match found
}

export default {
	name: 'module',
	type: 'document',
	icon: BlockElementIcon,
	fieldsets: [
		{ name: 'coordinates' },
		{ name: 'vimeo' },
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
			name: 'search',
			title: 'Display in search results',
			type: 'boolean',
			initialValue: true,
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'hierarchy',
			type: 'number',
			initialValue: 1,
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'kind',
			type: 'string',
			options: {
				list: kindList,
			},
			initialValue: 'image',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'size',
			type: 'string',
			options: {
				list: [
					{title: 'XS', value: 'xs'},
					{title: 'S', value: 's'},
					{title: 'M', value: 'm'},
					{title: 'L', value: 'l'},
					{title: 'XL', value: 'xl'},
				],
			},
			initialValue: 'm',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'position',
			description: 'Position of the module in single page. In search results it will always be centered',
			type: 'string',
			options: {
				list: [
					{title: 'Left', value: 'left'},
					{title: 'Center', value: 'center'},
					{title: 'Right', value: 'right'},
				],
			},
			initialValue: 'left',
			validation: (Rule) => Rule.required(),
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
		{
			name: 'location',
			type: 'reference',
			fieldset: 'coordinates',
			to: [{ type: 'location' }],
		},
		{
			name: 'tags',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'tag' }] }],
		},
		{
			name: 'project',
			description: 'Required if this module is not referenced in any project',
			type: 'reference',
			to: [{ type: 'project' }]
		},
		media,
		{
			name: 'id',
			type: 'string',
			fieldset: 'vimeo',
			hidden: ({ parent }) => !['vimeo'].includes(parent?.kind)
		},
		{
			name: 'hash',
			description: 'Required only for unlisted videos. It’s the code after “?h=” in Vimeo’s embed scripts',
			type: 'string',
			fieldset: 'vimeo',
			hidden: ({ parent }) => !['vimeo'].includes(parent?.kind)
		},
		// {
		// 	name: 'cover',
		// 	type: 'image',
		// 	fieldset: 'vimeo',
		// 	hidden: ({ parent }) => !['vimeo'].includes(parent?.kind)
		// },
		{
			name: 'color',
			type: 'color',
			options: {
				disableAlpha: true
			},
			hidden: ({ parent }) => !['box'].includes(parent?.kind)
		},
		{
			name: 'textTitle',
			type: 'string',
			hidden: ({ parent }) => !['box'].includes(parent?.kind)
		},
		{
			name: 'text1',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{ value: 'normal', title: 'Normal' },
						{ value: 'h3', title: 'H3' },
					],
					lists: [
						{title: 'Bullet', value: 'bullet'}
					],
					marks: {
						decorators: [],
						annotations: [
							{
								name: 'link',
								type: 'object',
								fields: [
									{
										name: 'url',
										type: 'string',
										validation: Rule =>
											Rule.custom(href => {
												if (!href) return true;
												return /^(https?:\/\/|mailto:|tel:)/.test(href)
													? true
													: 'Must be a valid URL, mailto:, or tel: link';
											}),
									},
									{
										title: 'Open in new tab',
										name: 'blank',
										type: 'boolean',
									},
								],
							},
						],
					},
				},
			],
			hidden: ({ parent }) => !['video', 'shortText', 'longText', 'box'].includes(parent?.kind)
		},
		{
			name: 'text2',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{ value: 'normal', title: 'Normal' },
						{ value: 'h3', title: 'H3' },
					],
					lists: [
						{title: 'Bullet', value: 'bullet'}
					],
					marks: {
						decorators: [],
						annotations: [
							{
								name: 'link',
								type: 'object',
								fields: [
									{
										name: 'url',
										type: 'string',
										validation: Rule =>
											Rule.custom(href => {
												if (!href) return true;
												return /^(https?:\/\/|mailto:|tel:)/.test(href)
													? true
													: 'Must be a valid URL, mailto:, or tel: link';
											}),
									},
									{
										title: 'Open in new tab',
										name: 'blank',
										type: 'boolean',
									},
								],
							},
						],
					},
				},
			],
			hidden: ({ parent }) => !['longText'].includes(parent?.kind)
		},
		{
			name: 'quotes',
			type: 'array',
			of: [
				{
					name: 'quote',
					type: 'object',
					icon: BlockquoteIcon,
					fields: [
						{
							name: 'quotation',
							type: 'string',
						},
						{
							name: 'author',
							type: 'reference',
							to: [{ type: 'company' }]
						}
					]
				}
			],
			hidden: ({ parent }) => !['quote'].includes(parent?.kind)
		},
	],
	preview: {
		select: {
			title: 'title',
			kind: 'kind',
			size: 'size',
			media: 'media'
		},
		prepare({ title, kind, size, media }) {
			let mediaUsed
			if (media) {
				if (media[0].asset) {
					mediaUsed = media[0].asset
				} else {
					mediaUsed = media[0].cover.asset
				} 
			}
			return {
				title,
				subtitle: `[${size.toUpperCase()}] ${getKindTitle(kind)}`,
				media: mediaUsed,
			};
		}
	}
};