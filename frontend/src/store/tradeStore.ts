import { create } from 'zustand';

interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBook {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

interface Trade {
  id: string;
  price: string;
  quantity: string;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface PriceInfo {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
}

interface TradeState {
  selectedPair: string;
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  prices: Record<string, PriceInfo>;
  wsConnected: boolean;
  
  setSelectedPair: (pair: string) => void;
  setOrderBook: (orderBook: OrderBook) => void;
  setRecentTrades: (trades: Trade[]) => void;
  setPrices: (prices: Record<string, PriceInfo>) => void;
  setWsConnected: (connected: boolean) => void;
}

const SUPPORTED_PAIRS = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];

export const useTradeStore = create<TradeState>((set) => ({
  selectedPair: 'TON/USDT',
  orderBook: null,
  recentTrades: [],
  prices: {},
  wsConnected: false,

  setSelectedPair: (pair) => {
    if (SUPPORTED_PAIRS.includes(pair)) {
      set({ selectedPair: pair });
    }
  },

  setOrderBook: (orderBook) => set({ orderBook }),
  
  setRecentTrades: (trades) => set({ recentTrades: trades.slice(0, 50) }),
  
  setPrices: (prices) => set({ prices }),
  
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
