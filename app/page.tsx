import { PortfolioSummaryCard } from "../components/PortfolioSummaryCard";
import { HoldingsTable } from "../components/HoldingsTable";
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
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="mx-auto max-w-[1200px] space-y-4">
        <h1 className="text-2xl font-semibold">Portfolio Lite</h1>

        <PortfolioSummaryCard
          totalValue={totalValueDisplay}
          changePct={changePctDisplay}
          pnl24h={pnl24hDisplay}
          holdingsCount={holdingsCount}
        />

        <HoldingsTable holdings={mockHoldings} />
      </div>
    </main>
  );
}
