import { UserIcon } from '@sanity/icons'

export default {
  name: 'person',
  type: 'document',
  icon: UserIcon,
  fields: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'surname',
      type: 'string',
    },
    {
      name: 'slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: (doc) => `${doc.name}-${doc.surname}`,
        maxLength: 96,
      },
    },
    {
      name: 'bio',
      type: 'text',
      rows: 6,
    },
  ],
  orderings: [
    {
      title: 'Surname',
      name: 'surnameAsc',
      by: [
        { field: 'surname', direction: 'asc' },
      ],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      name: 'name',
      surname: 'surname',
    },
    prepare(selection) {
      const {name, surname} = selection;
      let currentName = name ? name : '';
      let currentSurname = surname ? surname : '';
      return {
        title: currentName + ' ' + currentSurname,
      };
    }
  }
};