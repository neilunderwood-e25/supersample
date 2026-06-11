export const HERO_BY_ID = /* GraphQL */ `
  query HeroById($id: String!, $preview: Boolean, $locale: String) {
    hero(id: $id, preview: $preview, locale: $locale) {
      sys {
        id
      }
      frontEndComponent
      headingLineOne
      headingLineTwo
      subheading
      ctaLabel
      ctaHref
      image {
        url
        width
        height
        title
      }
    }
  }
`;
