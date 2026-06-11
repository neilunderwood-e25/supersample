import type { VideoEntry, VideoType } from "@/lib/contentful/common/types";

/**
 * Renders a Video entry. `videoType` routes (switch-case) to a self-hosted
 * <video>, a YouTube embed, or a Vimeo embed. Add a provider by extending the
 * VideoType union, the Contentful enum, and a branch here.
 *
 * Note: browsers only honor autoplay when the video is also muted, so autoplay
 * forces muted on.
 */

type VideoPlayerProps = {
  video: VideoEntry;
  className?: string;
};

const buildEmbedParams = (video: VideoEntry) => {
  const params = new URLSearchParams();
  if (video.autoplay) {
    params.set("autoplay", "1");
    params.set("muted", "1");
    params.set("mute", "1");
  } else if (video.muted) {
    params.set("muted", "1");
    params.set("mute", "1");
  }
  if (video.loop) params.set("loop", "1");
  if (video.controls === false) params.set("controls", "0");
  return params;
};

function IframeFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function YouTubeVideo({ video }: { video: VideoEntry }) {
  if (!video.youtubeId) return null;
  const params = buildEmbedParams(video);
  // YouTube needs playlist=<id> alongside loop=1 to actually loop.
  if (video.loop) params.set("playlist", video.youtubeId);
  const src = `https://www.youtube.com/embed/${video.youtubeId}?${params.toString()}`;
  return (
    <IframeFrame src={src} title={video.title ?? video.altText ?? "YouTube video"} />
  );
}

function VimeoVideo({ video }: { video: VideoEntry }) {
  if (!video.vimeoId) return null;
  const params = buildEmbedParams(video);
  const src = `https://player.vimeo.com/video/${video.vimeoId}?${params.toString()}`;
  return (
    <IframeFrame src={src} title={video.title ?? video.altText ?? "Vimeo video"} />
  );
}

function SelfHostedVideo({ video }: { video: VideoEntry }) {
  const src = video.selfHostedSource?.url;
  if (!src) return null;
  return (
    <video
      src={src}
      poster={video.posterImage?.url ?? undefined}
      autoPlay={video.autoplay ?? false}
      loop={video.loop ?? false}
      muted={(video.muted ?? false) || (video.autoplay ?? false)}
      controls={video.controls ?? true}
      playsInline
      aria-label={video.altText ?? video.title ?? undefined}
      className="h-auto w-full"
    />
  );
}

export function VideoPlayer({ video, className }: VideoPlayerProps) {
  if (!video) return null;

  const player = (() => {
    switch (video.videoType as VideoType) {
      case "YouTube":
        return <YouTubeVideo video={video} />;
      case "Vimeo":
        return <VimeoVideo video={video} />;
      case "Self Hosted":
      default:
        return <SelfHostedVideo video={video} />;
    }
  })();

  if (!player) return null;
  return <div className={className}>{player}</div>;
}

export default VideoPlayer;
