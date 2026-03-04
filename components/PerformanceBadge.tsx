import { isNegative } from "../lib/format";

type Props = {
  value: string;
  variant?: "pill" | "text";
};

export function PerformanceBadge({ value, variant = "pill" }: Props) {
  const isPositive = !isNegative(value);

  const colorClass = isPositive
    ? "text-[var(--pill-positive-text)]"
    : "text-[var(--pill-negative-text)]";
  const pillClass = isPositive
    ? "bg-[var(--pill-positive-bg)]"
    : "bg-[var(--pill-negative-bg)]";

  if (variant === "text") {
    return <span className={["font-semibold", colorClass].join(" ")}>{value}</span>;
  }

  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-sm font-medium",
        pillClass,
        colorClass,
      ].join(" ")}
    >
      {value}
    </span>
  );
}
