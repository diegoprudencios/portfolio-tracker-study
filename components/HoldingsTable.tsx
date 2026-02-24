import type { Holding } from "../lib/mockData";
import { HoldingRow } from "./HoldingRow";

type Props = {
  holdings: Holding[];
};

export function HoldingsTable({ holdings }: Props) {
  if (!holdings.length) return null;

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs text-white/60">
        <div className="flex-1">Asset</div>
        <div className="w-24 text-right">Quantity</div>
        <div className="w-28 text-right">Value</div>
        <div className="w-20 text-right">24h</div>
      </div>

      <div className="divide-y divide-white/5">
        {holdings.map((holding) => (
          <HoldingRow key={holding.id} holding={holding} />
        ))}
      </div>
    </section>
  );
}

