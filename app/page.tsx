 "use client";

import { HoldingsTable } from "../components/HoldingsTable";
import { BubbleField } from "../components/BubbleField";
import { mockHoldings, type Holding } from "../lib/mockData";
import { formatCurrency, formatPercentage } from "../lib/format";

function calculatePortfolioSummary(holdings: Holding[]) {
  if (!holdings.length) {
    return {
      totalValue: 0,
      pnl24h: 0,
      changePct: 0,
    };
  }

  let totalCurrentValue = 0;
  let totalValue24hAgo = 0;

  for (const holding of holdings) {
    const currentValue = holding.quantity * holding.currentPrice;
    const price24hAgo =
      holding.change24h === -100
        ? 0
        : holding.currentPrice / (1 + holding.change24h / 100);
    const value24hAgo = holding.quantity * price24hAgo;

    totalCurrentValue += currentValue;
    totalValue24hAgo += value24hAgo;
  }

  const pnl24h = totalCurrentValue - totalValue24hAgo;
  const changePct =
    totalValue24hAgo > 0 ? (pnl24h / totalValue24hAgo) * 100 : 0;

  return {
    totalValue: totalCurrentValue,
    pnl24h,
    changePct,
  };
}

export default function Home() {

  const { totalValue, pnl24h, changePct } = calculatePortfolioSummary(
    mockHoldings,
  );

  const holdingsCount = mockHoldings.length;

  const totalValueDisplay = formatCurrency(totalValue);
  const changePctDisplay = formatPercentage(changePct);

  const pnl24hDisplay =
    pnl24h === 0
      ? formatCurrency(0)
      : `${pnl24h > 0 ? "+" : ""}${formatCurrency(Math.abs(pnl24h))}`;

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0a] p-5">
      <div className="flex flex-1 gap-4 min-h-0">

        {/* Left column — bubble physics field */}
        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
          <BubbleField holdings={mockHoldings} />
        </div>

        {/* Right column — 450px fixed, vertical stack */}
        <div className="w-[450px] shrink-0 flex flex-col gap-0 h-full">

          {/* Card 1 — Total value */}
          <div className="relative z-[1] rounded-tl-2xl rounded-tr-2xl border border-white/10 bg-[var(--color-card-wallet)] px-6 pt-5 pb-[60px] flex items-center justify-between">
            <p className="text-xs font-medium text-black/45">Total value</p>
            <div className="flex items-center gap-2">
              <span className="bg-transparent border border-black rounded-full px-2 py-0.5 text-xs font-medium text-[#0A0A0A]">{changePctDisplay}</span>
              <p className="text-2xl font-semibold text-[#0a0a0a]">{totalValueDisplay}</p>
            </div>
          </div>

          {/* Card 2 — 24h P&L */}
          <div className="-mt-[44px] relative z-[2] rounded-2xl border border-white/10 bg-[var(--color-card-pnl)] px-6 pt-5 pb-[60px] flex items-start justify-between">
            <p className="text-xs font-medium text-black/45">24h P&L</p>
            <p className="text-lg font-semibold text-[#0a0a0a]">{pnl24hDisplay}</p>
          </div>

          {/* Card 3 — Holdings */}
          <div className="-mt-[44px] relative z-[3] rounded-2xl border border-white/10 bg-[var(--color-card-holdings)] px-6 pt-5 pb-[60px] flex items-start justify-between">
            <p className="text-xs font-medium text-black/45">Holdings</p>
            <p className="text-lg font-semibold text-[#0a0a0a]">{holdingsCount} assets</p>
          </div>

          {/* HoldingsTable — fills remaining height */}
          <div className="-mt-[44px] relative z-[4] flex-1 min-h-0 rounded-2xl overflow-hidden">
            <div className="light h-full">
              <HoldingsTable holdings={mockHoldings} theme="light" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
