import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export function MetricCard({ label, children }: Props) {
  return (
    <div className="rounded-xl bg-[var(--bg-surface)] py-3 px-5 flex flex-col justify-center gap-1 min-h-[65px]">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <div className="text-lg">{children}</div>
    </div>
  );
}