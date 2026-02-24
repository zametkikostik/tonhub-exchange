interface Trade {
  id: string;
  price: string;
  quantity: string;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface RecentTradesProps {
  trades: Trade[];
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  if (trades.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No recent trades
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 flex items-center justify-between px-3 py-2 bg-dark-bg border-b border-dark-border text-xs text-gray-500">
        <span>Price (USDT)</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="divide-y divide-dark-border">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-3 py-2 text-xs hover:bg-dark-border cursor-pointer"
          >
            <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
              ${trade.price}
            </span>
            <span className="text-gray-300">{trade.quantity}</span>
            <span className="text-gray-500">
              {new Date(trade.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
