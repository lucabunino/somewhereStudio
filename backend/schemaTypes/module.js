import media from './objects/media';
import {BlockElementIcon, BlockquoteIcon} from '@sanity/icons'

const kindList = [
  {title: 'Image', value: 'image'},
  {title: 'Image sequence', value: 'imageSequence'},
  {title: 'Box', value: 'box'},
  {title: 'Vimeo', value: 'vimeo'},
  {title: 'Short Video', value: 'shortVideo'},
  {title: 'Social media', value: 'socialMedia'},
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
      name: 'cover',
      type: 'image',
      fieldset: 'vimeo',
      hidden: ({ parent }) => !['vimeo'].includes(parent?.kind)
    },
    {
      name: 'color',
      type: 'color',
      options: {
        disableAlpha: true
      },
      hidden: ({ parent }) => !['box'].includes(parent?.kind)
    },
    {
      name: 'text1',
      type: 'text',
      rows: 6,
      hidden: ({ parent }) => !['video', 'shortText', 'longText', 'box'].includes(parent?.kind)
    },
    {
      name: 'text2',
      type: 'text',
      rows: 6,
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