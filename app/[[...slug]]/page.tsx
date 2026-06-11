import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlexiblePageBySlug } from "@/lib/contentful/pages";
import { SectionsRenderer } from "@/lib/sections/SectionsRenderer";
import { splitLocaleFromSlug } from "@/lib/i18n/locale";
import { JsonLd } from "@/components/common/JsonLd";
import { absoluteUrl, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const slugPathFrom = (segments: string[]) =>
  segments.length ? `/${segments.join("/")}` : "/";

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const { locale, rest } = splitLocaleFromSlug(slug);
  const page = await getFlexiblePageBySlug(slugPathFrom(rest), {
    locale: locale.contentfulCode,
  });
  if (!page) return {};

  const seo = page.seo;
  const url = seo?.seoCanonicalUrl ?? absoluteUrl(slugPathFrom(rest));
  const description = seo?.seoDescription ?? SITE_DESCRIPTION;
  const ogTitle = seo?.seoTitle ?? page.pageTitle ?? SITE_TAGLINE;
  const ogImage = seo?.seoOgImage?.url ?? null;

  return {
    // Absolute when hand-authored so the layout's "%s | Super Sample Studio"
    // template doesn't double the brand; a plain page title gets the suffix.
    title: seo?.seoTitle ? { absolute: seo.seoTitle } : page.pageTitle ?? undefined,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: ogTitle,
      description,
      images: ogImage
        ? [
            {
              url: absoluteUrl(ogImage),
              width: seo?.seoOgImage?.width ?? undefined,
              height: seo?.seoOgImage?.height ?? undefined,
              alt: ogTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      images: ogImage ? [absoluteUrl(ogImage)] : undefined,
    },
    robots:
      seo?.seoNoIndex || seo?.seoNoFollow
        ? { index: !seo.seoNoIndex, follow: !seo.seoNoFollow }
        : undefined,
  };
};

export default async function FlexiblePageRoute({ params }: PageProps) {
  const { slug } = await params;
  const { locale, rest } = splitLocaleFromSlug(slug);
  const slugPath = slugPathFrom(rest);
  const page = await getFlexiblePageBySlug(slugPath, {
    locale: locale.contentfulCode,
  });
  if (!page) notFound();

  const schema = page.seo?.seoSchemaMarkup;

  return (
    <main lang={locale.htmlLang}>
      {schema && typeof schema === "object" ? (
        <JsonLd data={schema as Record<string, unknown>} />
      ) : null}
      <SectionsRenderer sections={page.sections} />
    </main>
  );
}
