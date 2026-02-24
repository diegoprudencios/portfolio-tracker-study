import { PerformanceBadge } from "./PerformanceBadge";
import { MetricCard } from "./MetricCard";

type Props = {
  totalValue: string;
  changePct: string;
  pnl24h: string;
  holdingsCount: number;
};

export function PortfolioSummaryCard({
  totalValue,
  changePct,
  pnl24h,
  holdingsCount,
}: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-end justify-end gap-4 w-fit">
        <div className="space-y-1">
          <p className="text-sm text-white/60">Total value</p>
          <p className="text-3xl font-semibold">{totalValue}</p>
        </div>

        <PerformanceBadge value={changePct} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricCard label="24h P&amp;L">
            <PerformanceBadge value={pnl24h} variant="text" />
        </MetricCard>

        <MetricCard label="Holdings">
            <span className="font-semibold">{holdingsCount} assets</span>
        </MetricCard>
</div>

    </section>
  );
}
