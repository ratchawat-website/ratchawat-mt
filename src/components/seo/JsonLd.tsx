interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

// JSON.stringify can emit "</script>" inside string values, which would close
// the inline <script> tag and enable HTML injection. Escaping "<" as <
// keeps the JSON syntactically valid while neutralising the breakout.
function safeStringify(item: Record<string, unknown>): string {
  return JSON.stringify(item).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeStringify(item) }}
        />
      ))}
    </>
  );
}
