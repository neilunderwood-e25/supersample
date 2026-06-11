import NextImage from "next/image";
import type { AssetEntry, ImageEntry } from "@/lib/contentful/common/types";

/**
 * Renders an Image entry with next/image optimization. When a `mobile` asset is
 * present it is art-directed in below the `md` breakpoint (720px); otherwise the
 * `desktop` asset is used at all sizes. SVGs bypass next/image (which would
 * rasterize them) and render as a plain <img>.
 */

type ResponsiveImageProps = {
  image: ImageEntry;
  className?: string;
  imgClassName?: string;
  /** Passed to next/image; defaults to full viewport width. */
  sizes?: string;
  /** Override the entry's `priority` flag (eager + high fetch priority). */
  priority?: boolean;
};

const isSvg = (asset: AssetEntry) =>
  asset.contentType === "image/svg+xml" || (asset.url ?? "").endsWith(".svg");

function Asset({
  asset,
  alt,
  sizes,
  priority,
  className,
}: {
  asset: AssetEntry;
  alt: string;
  sizes: string;
  priority: boolean;
  className: string;
}) {
  if (!asset.url) return null;

  if (isSvg(asset)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={asset.url} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }

  return (
    <NextImage
      src={asset.url}
      alt={alt}
      width={asset.width ?? 1200}
      height={asset.height ?? 800}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

export function ResponsiveImage({
  image,
  className,
  imgClassName = "h-auto w-full",
  sizes = "100vw",
  priority,
}: ResponsiveImageProps) {
  const desktop = image?.desktop;
  if (!desktop?.url) return null;

  const alt = image.altText ?? image.title ?? "";
  const isPriority = priority ?? image.priority ?? false;
  const mobile = image.mobile;

  return (
    <figure className={className}>
      {mobile?.url ? (
        <>
          <span className="hidden md:block">
            <Asset
              asset={desktop}
              alt={alt}
              sizes={sizes}
              priority={isPriority}
              className={imgClassName}
            />
          </span>
          <span className="block md:hidden">
            <Asset
              asset={mobile}
              alt={alt}
              sizes={sizes}
              priority={isPriority}
              className={imgClassName}
            />
          </span>
        </>
      ) : (
        <Asset
          asset={desktop}
          alt={alt}
          sizes={sizes}
          priority={isPriority}
          className={imgClassName}
        />
      )}
      {image.caption ? (
        <figcaption className="mt-2 text-sm text-[var(--text-muted)]">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default ResponsiveImage;
