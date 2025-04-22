import {EarthGlobeIcon} from '@sanity/icons'
export default {
  name: 'seo',
  title: 'SEO',
  icon: EarthGlobeIcon,
  type: 'document',
  fieldsets: [

  ],
  fields: [
    {
      name: 'SEOTitle',
      type: 'string',
    },
    {
      name: 'SEODescription',
      type: 'text',
      rows: 5,
    },
    {
      name: 'SEOImage',
      type: 'image',
      options: {
        accept: 'image/jpg,image/jpeg,image/png,image/webp',
      },
    },
  ],
}