 "use client";

import { useEffect, useState } from "react";
import { PortfolioSummaryCard } from "../components/PortfolioSummaryCard";
import { HoldingsTable } from "../components/HoldingsTable";
import { mockHoldings, type Holding } from "../lib/mockData";
import { formatCurrency, formatPercentage } from "../lib/format";
import { Moon, Sun } from "lucide-react";

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
  const [isLight, setIsLight] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "light") {
      document.documentElement.classList.add("light");
      setIsLight(true);
    }
  }, []);

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
    <main className="min-h-screen bg-[var(--bg-base)] text-white p-6">
      <div className="mx-auto max-w-[600px] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Portfolio Lite
          </h1>
          <button
            type="button"
            onClick={() => {
              const root = document.documentElement;

              setIsLight((prev) => {
                const next = !prev;

                if (next) {
                  root.classList.add("light");
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("theme", "light");
                  }
                } else {
                  root.classList.remove("light");
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("theme", "dark");
                  }
                }

                return next;
              });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            {isLight ? (
              <>
                <Moon className="h-4 w-4 text-[var(--text-primary)]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-[var(--text-primary)]" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

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
