import {ThLargeIcon} from '@sanity/icons'

export default {
  name: 'format',
  type: 'document',
  icon: ThLargeIcon,
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
  ],
};