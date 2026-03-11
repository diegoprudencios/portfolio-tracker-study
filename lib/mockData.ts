export type Holding = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  change24h: number;
};

function rand(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(v * factor) / factor;
}

export function generateHoldings(): Holding[] {
  const btcPrice  = rand(42000, 98000, 0);
  const ethPrice  = rand(1800,   6000, 0);
  const solPrice  = rand(60,      320, 2);
  const linkPrice = rand(8,        35, 2);

  const btcQty  = rand(0.05, 2.5,  3);
  const ethQty  = rand(0.5,  12,   2);
  const solQty  = rand(10,   300,  1);
  const linkQty = rand(30,   600,  0);
  const usdcQty = rand(500,  8000, 0);

  return [
    {
      id: "btc",
      symbol: "BTC",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      quantity: btcQty,
      costBasis: rand(btcPrice * btcQty * 0.5, btcPrice * btcQty * 1.4, 0),
      currentPrice: btcPrice,
      change24h: rand(-9, 9, 1),
    },
    {
      id: "eth",
      symbol: "ETH",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      quantity: ethQty,
      costBasis: rand(ethPrice * ethQty * 0.5, ethPrice * ethQty * 1.4, 0),
      currentPrice: ethPrice,
      change24h: rand(-9, 9, 1),
    },
    {
      id: "sol",
      symbol: "SOL",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
      quantity: solQty,
      costBasis: rand(solPrice * solQty * 0.5, solPrice * solQty * 1.4, 0),
      currentPrice: solPrice,
      change24h: rand(-12, 12, 1),
    },
    {
      id: "link",
      symbol: "LINK",
      name: "Chainlink",
      image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
      quantity: linkQty,
      costBasis: rand(linkPrice * linkQty * 0.5, linkPrice * linkQty * 1.4, 0),
      currentPrice: linkPrice,
      change24h: rand(-12, 12, 1),
    },
    {
      id: "usdc",
      symbol: "USDC",
      name: "USD Coin",
      image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
      quantity: usdcQty,
      costBasis: usdcQty,
      currentPrice: 1,
      change24h: 0,
    },
  ];
}

// Static fallback used for SSR — replaced with random values on the client after mount
export const mockHoldings: Holding[] = [
  { id: "btc",  symbol: "BTC",  name: "Bitcoin",    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",              quantity: 0.42,  costBasis: 16000, currentPrice: 62000, change24h:  2.4 },
  { id: "eth",  symbol: "ETH",  name: "Ethereum",   image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",            quantity: 3.1,   costBasis:  5200, currentPrice:  3300, change24h:  1.1 },
  { id: "sol",  symbol: "SOL",  name: "Solana",     image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",             quantity: 75,    costBasis:  7800, currentPrice:   145, change24h: -3.2 },
  { id: "link", symbol: "LINK", name: "Chainlink",  image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",  quantity: 210,   costBasis:  4200, currentPrice:  19.4, change24h:  0.8 },
  { id: "usdc", symbol: "USDC", name: "USD Coin",   image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",               quantity: 2500,  costBasis:  2500, currentPrice:     1, change24h:  0   },
];

