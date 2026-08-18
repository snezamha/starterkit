import { Star } from "lucide-react";

const starSizeMap: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarsDisplay({
  rating,
  size = "md",
}: {
  rating: number;
  size?: string;
}) {
  const clamped = Math.max(0, Math.min(rating, 5));
  const percent = (clamped / 5) * 100;
  const starClass = starSizeMap[size] ?? starSizeMap.md;

  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`${clamped} / 5`}
    >
      <span className="text-muted-foreground/30 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`${starClass} fill-current`} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${percent}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`${starClass} fill-current`} />
        ))}
      </span>
    </span>
  );
}
