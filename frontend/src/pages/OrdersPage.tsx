import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userApi, orderApi } from '../api';

export default function OrdersPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => userApi.getOrders({ limit: 50 }),
    refetchInterval: 5000,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel order');
    },
  });

  const filteredOrders = orders?.data.items.filter((order) => {
    if (filter === 'open') return ['pending', 'partially_filled'].includes(order.status);
    if (filter === 'closed') return ['filled', 'cancelled'].includes(order.status);
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        
        <div className="flex gap-2">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-ton-blue text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading orders...</div>
      ) : filteredOrders?.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders?.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onCancel={() => cancelOrderMutation.mutate(order.orderId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Order {
  orderId: string;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  status: string;
  price?: string;
  quantity: string;
  filledQuantity: string;
  total?: string;
  createdAt: string;
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const isBuy = order.side === 'buy';
  const isFilled = order.status === 'filled';
  const isCancelled = order.status === 'cancelled';
  const isOpen = !isFilled && !isCancelled;

  const filledPercent = (parseFloat(order.filledQuantity) / parseFloat(order.quantity)) * 100;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded font-medium ${
            isBuy ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {order.side.toUpperCase()}
          </span>
          <span className="font-medium">{order.pair}</span>
        </div>
        
        <span className={`text-xs px-2 py-0.5 rounded ${
          isFilled ? 'bg-green-500/20 text-green-500' :
          isCancelled ? 'bg-gray-500/20 text-gray-500' :
          'bg-yellow-500/20 text-yellow-500'
        }`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Price:</span>{' '}
          <span className="font-medium">${order.price || 'Market'}</span>
        </div>
        <div>
          <span className="text-gray-500">Amount:</span>{' '}
          <span className="font-medium">{order.quantity}</span>
        </div>
        <div>
          <span className="text-gray-500">Filled:</span>{' '}
          <span className="font-medium">{order.filledQuantity}</span>
        </div>
        <div>
          <span className="text-gray-500">Total:</span>{' '}
          <span className="font-medium">${order.total || '-'}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${filledPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        
        {isOpen && (
          <button
            onClick={onCancel}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
