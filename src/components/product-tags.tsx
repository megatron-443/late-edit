import { normaliseTags, type ProductTag, type ProductTagCategory } from "@/lib/mockData";

/** Status tags read as commerce signals, so they're filled rather than outlined. */
const emphasis: Record<ProductTagCategory, string> = {
  rarity: "border-foreground/70 text-foreground",
  material: "border-border text-muted-foreground",
  craft: "border-border text-muted-foreground",
  status: "border-foreground bg-foreground !text-background",
};

export function ProductTags({
  tags,
  className = "",
}: {
  tags: ProductTag[];
  className?: string;
}) {
  const list = normaliseTags(tags);
  if (list.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {list.map((t) => (
        <li key={`${t.category}-${t.label}`}>
          <span
            title={t.category}
            className={`label-eyebrow inline-flex items-center border px-2.5 py-1 text-[0.58rem] transition-colors duration-200 ${emphasis[t.category]}`}
          >
            {t.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
