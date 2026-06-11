/**
 * Reusable Image entry with an optional art-directed mobile asset. Asset fields
 * are inlined (rather than pulled from a shared `Asset` fragment) so this
 * fragment has no dependencies and can be combined freely without
 * duplicate-fragment collisions.
 *
 * Include this fragment definition exactly once per query document.
 */
export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    __typename
    sys {
      id
    }
    title
    altText
    caption
    priority
    desktop {
      sys {
        id
      }
      url
      width
      height
      description
      contentType
    }
    mobile {
      sys {
        id
      }
      url
      width
      height
      description
      contentType
    }
  }
`;
