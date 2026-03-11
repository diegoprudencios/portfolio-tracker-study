type Props = {
  value: string;
  variant?: "pill" | "text";
};

export function PerformanceBadge({ value, variant = "pill" }: Props) {
  if (variant === "text") {
    return <span className="text-xs font-semibold text-[#0A0A0A]">{value}</span>;
  }

  return (
    <span className="bg-transparent border border-black rounded-full px-2 py-0.5 text-xs font-medium text-[#0A0A0A]">
      {value}
    </span>
  );
}
