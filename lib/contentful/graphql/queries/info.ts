export const INFO_BY_ID = /* GraphQL */ `
  query InfoById($id: String!, $preview: Boolean, $locale: String) {
    info(id: $id, preview: $preview, locale: $locale) {
      sys {
        id
      }
      frontEndComponent
      eyebrow
      heading
      subheading
      statsCollection(limit: 12) {
        items {
          sys {
            id
          }
          prefix
          value
          suffix
          label
        }
      }
      logosCollection(limit: 30) {
        items {
          url
          title
          width
          height
        }
      }
    }
  }
`;
