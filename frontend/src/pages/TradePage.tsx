import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tradeApi, orderApi, userApi } from '../api';
import { useTradeStore } from '../store/tradeStore';
import { useAuthStore } from '../store/authStore';
import OrderBook from '../components/OrderBook';
import TradeForm from '../components/TradeForm';
import RecentTrades from '../components/RecentTrades';
import PriceChart from '../components/PriceChart';

export default function TradePage() {
  const [searchParams] = useSearchParams();
  const { selectedPair, setSelectedPair } = useTradeStore();
  const { isAuthenticated } = useAuthStore();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');

  // Update pair from URL
  useEffect(() => {
    const pair = searchParams.get('pair');
    if (pair) {
      setSelectedPair(pair);
    }
  }, [searchParams, setSelectedPair]);

  const { data: orderBook } = useQuery({
    queryKey: ['orderbook', selectedPair],
    queryFn: () => tradeApi.getOrderBook(selectedPair, 20),
    refetchInterval: 1000,
  });

  const { data: recentTrades } = useQuery({
    queryKey: ['trades', selectedPair],
    queryFn: () => tradeApi.getRecentTrades(selectedPair, 50),
    refetchInterval: 2000,
  });

  const { data: prices } = useQuery({
    queryKey: ['prices'],
    queryFn: tradeApi.getPrices,
    refetchInterval: 10000,
  });

  const currentPrice = prices?.data?.[selectedPair]?.price || '0';

  return (
    <div className="h-full flex flex-col">
      {/* Pair Selector */}
      <div className="p-3 border-b border-dark-border">
        <PairSelector 
          selectedPair={selectedPair} 
          onSelect={setSelectedPair}
          prices={prices?.data}
        />
      </div>

      {/* Price Info */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">${currentPrice}</div>
            <div className={`text-sm ${
              parseFloat(prices?.data?.[selectedPair]?.change24h || '0') >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {prices?.data?.[selectedPair]?.change24h || '0'}%
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div>24h High: ${prices?.data?.[selectedPair]?.high24h || '0'}</div>
            <div>24h Low: ${prices?.data?.[selectedPair]?.low24h || '0'}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 border-b border-dark-border">
        <PriceChart pair={selectedPair} />
      </div>

      {/* Trading Interface */}
      <div className="flex-1 grid grid-cols-2 gap-px bg-dark-border overflow-auto">
        {/* Order Book */}
        <div className="bg-dark-bg overflow-auto">
          <OrderBook orderBook={orderBook?.data} />
        </div>

        {/* Trade Form & Recent Trades */}
        <div className="bg-dark-bg flex flex-col">
          <TradeForm
            pair={selectedPair}
            side={side}
            onSideChange={setSide}
            currentPrice={currentPrice}
          />
          
          <div className="flex-1 border-t border-dark-border overflow-auto">
            <RecentTrades trades={recentTrades?.data || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PairSelector({ 
  selectedPair, 
  onSelect,
  prices 
}: { 
  selectedPair: string; 
  onSelect: (pair: string) => void;
  prices?: Record<string, any>;
}) {
  const pairs = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];

  return (
    <div className="flex gap-2 overflow-x-auto">
      {pairs.map((pair) => {
        const isActive = selectedPair === pair;
        const price = prices?.[pair]?.price || '0';
        const change = prices?.[pair]?.change24h || '0';
        const isPositive = parseFloat(change) >= 0;

        return (
          <button
            key={pair}
            onClick={() => onSelect(pair)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-ton-blue text-white'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            <div className="font-medium text-sm">{pair}</div>
            <div className={`text-xs ${
              isActive ? 'text-gray-200' : isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              ${price} {isPositive ? '+' : ''}{change}%
            </div>
          </button>
        );
      })}
    </div>
  );
}
