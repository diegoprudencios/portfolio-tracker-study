import { isNegative } from "../lib/format";

type Props = {
  value: string;
  variant?: "pill" | "text";
};

export function PerformanceBadge({ value, variant = "pill" }: Props) {
  const isPositive = !isNegative(value);

  const colorClass = isPositive ? "text-emerald-300" : "text-rose-300";
  const pillClass = isPositive ? "bg-emerald-500/15" : "bg-rose-500/15";

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
