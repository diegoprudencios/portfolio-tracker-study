import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export function MetricCard({ label, children }: Props) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <div className="mt-1 text-lg">{children}</div>
    </div>
  );
}
