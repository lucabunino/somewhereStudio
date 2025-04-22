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