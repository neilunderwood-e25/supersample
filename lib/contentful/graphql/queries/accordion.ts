export const ACCORDION_BY_ID = /* GraphQL */ `
  query AccordionById($id: String!, $preview: Boolean, $locale: String) {
    accordion(id: $id, preview: $preview, locale: $locale) {
      sys {
        id
      }
      frontEndComponent
      heading
      servicesCollection(limit: 12) {
        items {
          sys {
            id
          }
          title
          description
        }
      }
    }
  }
`;
