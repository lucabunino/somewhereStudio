export default {
	name: 'media',
	type: 'array',
	title: 'Media',
	of: [
		{
			type: 'image',
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
			name: 'video',
			type: 'object',
			title: 'Video',
			fields: [
				{
					name: 'mp4',
					title: 'Video (.mp4)',
					type: 'file',
					options: {
						accept: 'video/mp4',
						storeOriginalFilename: true,
					},
					validation: (Rule) => Rule.required(),
				},
				{
					name: 'cover',
					type: 'image',
				},
				{
					name: 'caption',
					type: 'string',
				},
				{
					name: 'altText',
					type: 'string',
				}
			],
			preview: {
				select: {
					title: 'mp4.asset.originalFilename',
					media: 'cover',
				},
				prepare({ title, media }) {
					return {
						title: title || 'No filename',
						media,
					};
				}
			}
		}
	],
	options: {
		layout: 'grid'
	},
	hidden: ({ parent }) => !['image', 'composition', 'slider', 'shortVideo', 'socialMedia', 'box'].includes(parent?.kind)
};