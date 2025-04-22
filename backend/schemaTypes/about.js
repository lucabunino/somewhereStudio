import {ListIcon, UserIcon} from '@sanity/icons'

export default {
  name: 'about',
  type: 'document',
  icon: ListIcon,
  fields: [
    {
      name: 'title',
      type: 'string',
      hidden: true,
    },
    {
      name: 'about',
      type: 'text',
    },
    {
      name: 'people',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
    },
    {
      name: 'clients',
      type: 'text',
    },
  ],
};