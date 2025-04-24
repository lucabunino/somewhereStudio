import { HomeIcon } from '@sanity/icons';

export default {
  name: 'homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    {
      name: 'title',
      type: 'string',
      hidden: false,
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