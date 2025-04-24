import {VersionsIcon} from '@sanity/icons'

export default {
  name: 'serie',
  type: 'document',
  icon: VersionsIcon,
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