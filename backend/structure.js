import { EarthGlobeIcon, ListIcon, InfoOutlineIcon, TagsIcon, ProjectsIcon, HomeIcon } from '@sanity/icons'

export const myStructure = (S, context) => {
  const entities = [
    S.divider(),
    S.listItem()
      .title('Homepage')
      .icon(HomeIcon)
      .child(S.document().schemaType('homepage').documentId('homepage')),
    S.documentTypeListItem('project')
      .icon(ProjectsIcon)
      .title('Projects'),
    S.divider(),
    S.documentTypeListItem('module')
      .title('Modules'),
    S.documentTypeListItem('serie')
      .title('Series'),
    S.divider(),
    S.documentTypeListItem('tag')
      .icon(TagsIcon)
      .title('Tags'),
    S.documentTypeListItem('format')
      .title('Formats'),
    S.documentTypeListItem('location')
      .title('Locations'),
    S.documentTypeListItem('company')
      .title('Companies'),
    S.documentTypeListItem('person')
      .title('People'),
    S.divider(),
    S.listItem()
      .title('About')
      .icon(ListIcon)
      .child(S.document().schemaType('about').documentId('about')),
    S.listItem()
      .title('Info')
      .icon(InfoOutlineIcon)
      .child(S.document().schemaType('info').documentId('info')),
  ];
  const siteSettings = [
    S.divider(),
    S.listItem()
      .title('SEO')
      .icon(EarthGlobeIcon)
      .child(S.document().schemaType('seo').documentId('seo')),
    S.documentTypeListItem('policy')
      .title('Policies'),
  ];

  return S.list()
    .title('Content')
    .items([
      ...entities,
      ...siteSettings,
    ]);
};