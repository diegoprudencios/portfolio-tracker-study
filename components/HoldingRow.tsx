 "use client";

import { useState } from "react";
import { PerformanceBadge } from "./PerformanceBadge";
import { formatCurrency, formatPercentage } from "../lib/format";
import type { Holding } from "../lib/mockData";

type Props = {
  holding: Holding;
};

export function HoldingRow({ holding }: Props) {
  const [imageError, setImageError] = useState(false);

  const currentValue = holding.quantity * holding.currentPrice;
  const changeLabel = formatPercentage(holding.change24h);

  const symbol = holding.symbol.toUpperCase();

  const avatarBgClass =
    symbol === "BTC"
      ? "bg-orange-500"
      : symbol === "ETH"
        ? "bg-sky-500"
        : symbol === "SOL"
          ? "bg-purple-500"
          : symbol === "LINK"
            ? "bg-blue-700"
            : symbol === "USDC"
              ? "bg-emerald-500"
              : "bg-[var(--bg-surface-hover)]";

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ease-out hover:bg-[var(--bg-surface-hover)]">
      <div className="flex flex-1 items-center gap-3">
        {holding.image && !imageError ? (
          <img
            src={holding.image}
            alt={holding.name}
            className="h-8 w-8 rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-[var(--text-primary)]",
              avatarBgClass,
            ].join(" ")}
          >
            {symbol.charAt(0)}
          </div>
        )}

        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {holding.name}
          </p>
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            {holding.symbol}
          </p>
        </div>
      </div>

      <div className="w-24 text-right text-sm tabular-nums text-[var(--text-primary)] font-mono">
        {holding.quantity.toLocaleString("en-US", {
          maximumFractionDigits: 6,
        })}
      </div>

      <div className="w-28 text-right text-sm tabular-nums text-[var(--text-primary)] font-mono">
        {formatCurrency(currentValue)}
      </div>

      <div className="w-24 flex items-center justify-end h-8">
        <PerformanceBadge value={changeLabel} />
      </div>
    </div>
  );
}

