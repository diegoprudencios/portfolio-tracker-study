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

export const mockHoldings: Holding[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    quantity: 0.42,
    costBasis: 16000, // total USD spent
    currentPrice: 62000,
    change24h: 2.4,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    quantity: 3.1,
    costBasis: 5200,
    currentPrice: 3300,
    change24h: 1.1,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    quantity: 75,
    costBasis: 7800,
    currentPrice: 145,
    change24h: -3.2,
  },
  {
    id: "link",
    symbol: "LINK",
    name: "Chainlink",
    image:
      "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    quantity: 210,
    costBasis: 4200,
    currentPrice: 19.4,
    change24h: 0.8,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    quantity: 2500,
    costBasis: 2500,
    currentPrice: 1,
    change24h: 0,
  },
];

