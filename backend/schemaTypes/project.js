import {SquareIcon} from '@sanity/icons'

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
  ],
};