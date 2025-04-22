import {InfoFilledIcon} from '@sanity/icons'
import {EmptyIcon} from '@sanity/icons'

export default {
  name: 'info',
  type: 'document',
  icon: InfoFilledIcon,
  fields: [
    {
      name: 'title',
      type: 'string',
      hidden: false,
    },
    {
      name: 'ragioneSociale',
      type: 'string',
    },
    {
      name: 'email',
      type: 'string',
    },
    {
      name: 'adress',
      type: 'text',
      rows: 2,
    },
    {
      name: 'adressLink',
      type: 'url',
    },
    {
      name: 'socials',
      type: 'array',
      of: [
        {
          name: 'social',
          type: 'object',
          icon: EmptyIcon,
          options: { columns: 2,},
          fields: [
            {
              name: 'socialName',
              type: 'string'
            },
            {
              name: 'socialUrl',
              type: 'url'
            },
          ]
        },
      ]
    },
    {
      name: 'pIva',
      title: 'P. IVA',
      type: 'string',
    },
    {
      name: 'ccia',
      title: 'CIIA',
      type: 'string',
    },
    {
      name: 'capitaleSociale',
      type: 'string',
    },
  ],
};