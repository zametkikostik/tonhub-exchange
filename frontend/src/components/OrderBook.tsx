interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBookData {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

interface OrderBookProps {
  orderBook: OrderBookData | null;
}

export default function OrderBook({ orderBook }: OrderBookProps) {
  if (!orderBook) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading order book...
      </div>
    );
  }

  const maxQuantity = Math.max(
    ...orderBook.bids.map((b) => parseFloat(b.quantity)),
    ...orderBook.asks.map((a) => parseFloat(a.quantity)),
    1
  );

  const renderRow = (entry: OrderBookEntry, type: 'bid' | 'ask') => {
    const quantity = parseFloat(entry.quantity);
    const percentage = (quantity / maxQuantity) * 100;
    const bgColor = type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10';

    return (
      <div
        key={entry.price}
        className="relative flex items-center justify-between px-2 py-1 text-xs hover:bg-dark-border cursor-pointer"
      >
        <div
          className={`absolute inset-0 ${bgColor} transition-all duration-150`}
          style={{ width: `${percentage}%`, right: type === 'ask' ? 0 : 'auto', left: type === 'bid' ? 0 : 'auto' }}
        />
        <span className={`relative z-10 ${type === 'bid' ? 'text-green-500' : 'text-red-500'}`}>
          ${entry.price}
        </span>
        <span className="relative z-10 text-gray-300">{entry.quantity}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 flex items-center justify-between px-2 py-2 bg-dark-bg border-b border-dark-border text-xs text-gray-500">
        <span>Price (USDT)</span>
        <span>Amount</span>
      </div>

      {/* Asks (Sell orders) - reversed to show lowest at bottom */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col-reverse overflow-auto">
          {orderBook.asks.slice(0, 15).map((ask) => renderRow(ask, 'ask'))}
        </div>
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center px-2 py-2 bg-dark-card border-y border-dark-border">
        <span className="text-sm font-medium">
          {orderBook.bids[0] && orderBook.asks[0] ? (
            <>
              <span className="text-green-500">${orderBook.bids[0].price}</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-red-500">${orderBook.asks[0].price}</span>
              <span className="mx-2 text-gray-500">
                Spread: ${(parseFloat(orderBook.asks[0].price) - parseFloat(orderBook.bids[0].price)).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-500">No orders</span>
          )}
        </span>
      </div>

      {/* Bids (Buy orders) */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {orderBook.bids.slice(0, 15).map((bid) => renderRow(bid, 'bid'))}
        </div>
      </div>
    </div>
  );
}
