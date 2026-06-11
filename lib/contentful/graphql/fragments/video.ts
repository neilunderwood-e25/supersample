/**
 * Reusable Video entry. `videoType` switches the player between a self-hosted
 * Contentful asset, a YouTube id, or a Vimeo id (extend the enum + the
 * VideoPlayer switch-case to add more providers).
 *
 * Include this fragment definition exactly once per query document.
 */
export const VIDEO_FRAGMENT = /* GraphQL */ `
  fragment VideoFields on Video {
    __typename
    sys {
      id
    }
    title
    altText
    videoType
    youtubeId
    vimeoId
    autoplay
    loop
    muted
    controls
    selfHostedSource {
      sys {
        id
      }
      url
      width
      height
      contentType
    }
    posterImage {
      url
      width
      height
    }
  }
`;
