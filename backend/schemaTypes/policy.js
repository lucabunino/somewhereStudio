import {DocumentTextIcon} from '@sanity/icons';

export default {
	name: 'policy',
	type: 'document',
	icon: DocumentTextIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
		},
		{
			name: 'kind',
			type: 'string',
			options: {
				list: [
					{title: 'Cookie policy', value: 'cookies'},
					{title: 'Privacy policy', value: 'privacy'},
				],
				layout: 'radio'
			},
			initialValue: 'cookies',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'body',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{value: 'normal', title: 'Normal'},
						{value: 'h3', title: 'H3'},
						{value: 'h4', title: 'H4'},
					],
					lists: [
						{title: 'Bullet', value: 'bullet'},
					],
					marks: {
						annotations: [
							{
								name: 'link',
								type: 'object',
								fields: [
									{
										name: 'url',
										type: 'string', // Change to string to allow custom validation
										validation: Rule =>
											Rule.custom(href => {
												if (!href) return true; // Allow empty field
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
						]
					},
				}
			]
		},
	],
}