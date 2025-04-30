import {VersionsIcon} from '@sanity/icons'

export default {
  name: 'serie',
  type: 'document',
  icon: VersionsIcon,
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
      description: 'Required if this serie is not referenced in any project',
      type: 'reference',
      to: [{ type: 'project' }]
    },
    {
      name: 'modules',
      type: 'array',
      of: [
        {
          name: 'module',
          type: 'reference',
          to: [{ type: 'module' }],
          validation: (Rule) => Rule.required(),
        },
      ],
    },
  ],
};