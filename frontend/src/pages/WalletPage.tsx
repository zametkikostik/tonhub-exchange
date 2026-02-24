import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userApi, walletApi } from '../api';
import { useTonConnectUI } from '@tonconnect/ui-react';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [tonConnectUI] = useTonConnectUI();
  const queryClient = useQueryClient();

  const { data: balances } = useQuery({
    queryKey: ['balances'],
    queryFn: userApi.getBalances,
    refetchInterval: 5000,
  });

  const { data: depositAddress } = useQuery({
    queryKey: ['depositAddress'],
    queryFn: walletApi.getDepositAddress,
  });

  const withdrawMutation = useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      toast.success('Withdrawal request submitted!');
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Withdrawal failed');
    },
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    withdrawMutation.mutate({
      currency: formData.get('currency') as string,
      amount: formData.get('amount') as string,
      address: formData.get('address') as string,
      memo: formData.get('memo') as string || undefined,
    });
  };

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        {balances?.data?.balances.map((balance) => (
          <div key={balance.currency} className="card p-4">
            <div className="text-sm text-gray-400 mb-1">{balance.currency}</div>
            <div className="text-xl font-bold">{parseFloat(balance.available).toFixed(4)}</div>
            <div className="text-xs text-gray-500">
              Locked: {parseFloat(balance.locked).toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'deposit'
              ? 'bg-ton-blue text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'withdraw'
              ? 'bg-ton-blue text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Deposit Section */}
      {activeTab === 'deposit' && (
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold">Deposit TON</h3>
          
          {depositAddress?.data ? (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">Your deposit address</div>
                <div className="card p-3 break-all font-mono text-sm">
                  {depositAddress.data.address}
                </div>
                {depositAddress.data.memo && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Memo</div>
                    <div className="font-mono text-lg">{depositAddress.data.memo}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(depositAddress.data.address);
                  toast.success('Address copied!');
                }}
                className="btn-secondary w-full"
              >
                Copy Address
              </button>

              <div className="text-xs text-gray-500 text-center">
                ⚠️ Send only TON to this address. Other tokens may be lost.
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">Loading deposit address...</div>
          )}
        </div>
      )}

      {/* Withdraw Section */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdraw} className="card p-4 space-y-4">
          <h3 className="font-semibold">Withdraw</h3>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Currency</label>
            <select name="currency" className="input w-full">
              <option value="TON">TON</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount</label>
            <input
              type="number"
              name="amount"
              step="0.0001"
              className="input w-full"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Address</label>
            <input
              type="text"
              name="address"
              className="input w-full"
              placeholder="EQB..."
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Memo (optional)</label>
            <input
              type="text"
              name="memo"
              className="input w-full"
              placeholder="Memo"
            />
          </div>

          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
      )}

      {/* Connect TON Wallet */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3">Connect TON Wallet</h3>
        {tonConnectUI.connected ? (
          <div className="text-green-500">✓ Wallet connected</div>
        ) : (
          <button onClick={handleConnectWallet} className="btn-primary w-full">
            Connect Tonkeeper
          </button>
        )}
      </div>
    </div>
  );
}
