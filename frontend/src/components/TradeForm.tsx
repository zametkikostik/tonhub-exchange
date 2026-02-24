import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderApi, userApi } from '../api';

interface TradeFormProps {
  pair: string;
  side: 'buy' | 'sell';
  onSideChange: (side: 'buy' | 'sell') => void;
  currentPrice: string;
}

export default function TradeForm({ pair, side, onSideChange, currentPrice }: TradeFormProps) {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(currentPrice);
  const [quantity, setQuantity] = useState('');

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      toast.success('Order placed successfully!');
      setQuantity('');
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to place order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      pair,
      side,
      type: orderType,
      price: orderType === 'limit' ? price : undefined,
      quantity,
    };

    createOrderMutation.mutate(orderData);
  };

  const total = (parseFloat(price || '0') * parseFloat(quantity || '0')).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-dark-border space-y-3">
      {/* Buy/Sell Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSideChange('buy')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            side === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => onSideChange('sell')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            side === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-2">
        {(['limit', 'market'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`flex-1 py-1 text-sm rounded transition-colors ${
              orderType === type
                ? 'bg-ton-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Price Input */}
      {orderType === 'limit' && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Price (USDT)</label>
          <input
            type="number"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input w-full"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Amount ({pair.split('/')[0]})</label>
        <input
          type="number"
          step="0.0001"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="input w-full"
          placeholder="0.00"
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-medium">${orderType === 'market' ? 'Market' : total}</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!quantity || parseFloat(quantity) <= 0 || createOrderMutation.isPending}
        className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          side === 'buy'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {createOrderMutation.isPending ? 'Placing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${pair.split('/')[0]}`}
      </button>
    </form>
  );
}
