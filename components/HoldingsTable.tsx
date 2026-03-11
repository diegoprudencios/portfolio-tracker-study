import type { Holding } from "../lib/mockData";
import { HoldingRow } from "./HoldingRow";

type Props = {
  holdings: Holding[];
  theme?: "light" | "dark";
};

export function HoldingsTable({ holdings, theme }: Props) {
  if (!holdings.length) return null;

  return (
    <section className="h-full bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-3 text-xs text-[var(--text-secondary)]">
        <div className="flex-1">Asset</div>
        <div className="w-24 text-right">Quantity</div>
        <div className="w-28 text-right">Value</div>
        <div className="w-24 text-right">24h</div>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {holdings.map((holding) => (
          <HoldingRow key={holding.id} holding={holding} />
        ))}
      </div>
    </section>
  );
}

