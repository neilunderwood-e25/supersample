/**
 * Renders a JSON-LD structured-data block. `JSON.stringify` drops undefined
 * values, so empty fields are never emitted. Use one per schema object.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
