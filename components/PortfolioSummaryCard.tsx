import { PerformanceBadge } from "./PerformanceBadge";

type Props = {
  totalValue: string;
  changePct: string;
  pnl24h: string;
  holdingsCount: number;
  className?: string;
};

export function PortfolioSummaryCard({
  totalValue,
  changePct,
  pnl24h,
  holdingsCount,
  className,
}: Props) {
  return (
    <section className={`flex-1 w-full h-full grid grid-cols-2 gap-3${className ? ` ${className}` : ""}`}>
      {/* Cell 1: Total value + Performance (full width) */}
      <div className="col-span-2 h-full w-full rounded-tl-2xl rounded-tr-2xl border border-white/10 bg-[var(--color-card-wallet)] p-10 flex flex-col justify-start">
        <div className="space-y-2">
          <p className="text-sm text-[var(--text-secondary)]">Total value</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl md:text-4xl font-semibold leading-none font-mono text-[var(--text-primary)]">
              {totalValue}
            </p>
            <PerformanceBadge value={changePct} />
          </div>
        </div>
      </div>

      {/* Cell 2: 24h P&L */}
      <div className="cell-pnl hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 min-h-[110px] flex flex-col justify-center gap-2">
        <p className="text-xs text-[var(--text-secondary)]">24h P&amp;L</p>
        <div className="text-lg font-mono">
          <PerformanceBadge value={pnl24h} variant="text" />
        </div>
      </div>

      {/* Cell 3: Holdings count */}
      <div className="cell-holdings hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 min-h-[110px] flex flex-col justify-center gap-2">
        <p className="text-xs text-[var(--text-secondary)]">Holdings</p>
        <span className="text-lg font-semibold text-[var(--text-primary)]">
          {holdingsCount} assets
        </span>
      </div>
    </section>
  );
}