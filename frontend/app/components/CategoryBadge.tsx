import { Category, CATEGORY_COLORS, CATEGORY_BG } from "../types";

export default function CategoryBadge({ category }: { category: Category }) {
  const color = CATEGORY_COLORS[category];
  const bg = CATEGORY_BG[category];

  return (
    <span
      style={{
        color,
        background: bg,
        border: `1px solid ${color}40`,
        padding: "3px 10px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "DM Mono, monospace",
        fontWeight: 500,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}
