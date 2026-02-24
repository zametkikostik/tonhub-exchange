import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tradeApi } from '../api';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { data: prices } = useQuery({
    queryKey: ['prices'],
    queryFn: tradeApi.getPrices,
    refetchInterval: 10000,
  });

  return (
    <div className="p-4 space-y-6">
      {/* SEO Content Section */}
      <SEOContent />

      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">TonHub Exchange</span>
        </h1>
        <p className="text-gray-400 mb-6">
          Trade crypto on TON blockchain directly in Telegram
        </p>
        
        {!isAuthenticated && (
          <Link to="/auth/callback" className="btn-primary inline-block">
            Connect Wallet
          </Link>
        )}
      </div>

      {/* Market Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Market Overview</h2>
        
        {prices?.data && Object.entries(prices.data as Record<string, {price: string; change24h: string}>).map(([pair, info]) => {
          const [base] = pair.split('/');
          const change = parseFloat(info.change24h);
          const isPositive = change >= 0;
          
          return (
            <Link
              key={pair}
              to={`/trade?pair=${pair}`}
              className="card p-4 flex items-center justify-between hover:border-ton-blue transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ton-blue to-primary-600 flex items-center justify-center font-bold text-sm">
                  {base.slice(0, 3)}
                </div>
                <div>
                  <div className="font-medium">{pair}</div>
                  <div className="text-xs text-gray-500">Vol: 1.2M</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">${info.price}</div>
                <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{info.change24h}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/trade" className="card p-4 text-center hover:border-ton-blue transition-colors">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium">Trade</div>
          <div className="text-xs text-gray-500">Buy & Sell</div>
        </Link>
        
        <Link to="/wallet" className="card p-4 text-center hover:border-ton-blue transition-colors">
          <div className="text-2xl mb-2">💼</div>
          <div className="font-medium">Wallet</div>
          <div className="text-xs text-gray-500">Deposit & Withdraw</div>
        </Link>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Features</h2>
        
        <div className="card p-4 space-y-3">
          <FeatureItem 
            icon="⚡" 
            title="Fast Trading" 
            description="Lightning-fast order matching on TON blockchain" 
          />
          <FeatureItem 
            icon="🔒" 
            title="Secure" 
            description="Your funds are protected with industry-leading security" 
          />
          <FeatureItem 
            icon="💰" 
            title="Low Fees" 
            description="Competitive trading fees starting at 0.1%" 
          />
          <FeatureItem 
            icon="📱" 
            title="Mobile First" 
            description="Optimized for Telegram Mini Apps" 
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}

// SEO Content Section with targeted keywords
function SEOContent() {
  return (
    <article className="sr-only">
      <h1>TonHub Exchange - Cryptocurrency Trading on TON Blockchain</h1>
      
      <section>
        <h2>Trade Cryptocurrency in Telegram</h2>
        <p>
          TonHub Exchange is a revolutionary cryptocurrency trading platform built on 
          TON blockchain, accessible directly through Telegram Mini Apps. Trade TON, 
          USDT, BTC, and other digital assets with lightning-fast execution and 
          industry-low fees of just 0.1%.
        </p>
      </section>

      <section>
        <h2>Why Choose TonHub Exchange?</h2>
        <ul>
          <li>Instant trading via Telegram - no downloads required</li>
          <li>TON Connect integration for secure wallet connections</li>
          <li>Real-time order book and price charts</li>
          <li>Low trading fees - only 0.1% per transaction</li>
          <li>Fast deposits and withdrawals on TON blockchain</li>
          <li>Advanced security with 2FA and withdrawal whitelists</li>
          <li>Mobile-optimized interface for trading on the go</li>
        </ul>
      </section>

      <section>
        <h2>How to Start Trading</h2>
        <ol>
          <li>Open TonHub Exchange in Telegram</li>
          <li>Connect your TON wallet (Tonkeeper, MyTonWallet, or Tonhub)</li>
          <li>Deposit TON or USDT to your exchange wallet</li>
          <li>Choose a trading pair (TON/USDT, TON/BTC, NOT/TON)</li>
          <li>Place a buy or sell order at market or limit price</li>
          <li>Track your orders and portfolio in real-time</li>
        </ol>
      </section>

      <section>
        <h2>Supported Trading Pairs</h2>
        <p>
          Trade popular cryptocurrency pairs including TON/USDT, TON/BTC, 
          NOT/TON, and USDT/TON. More pairs are added regularly based on 
          community demand.
        </p>
      </section>

      <section>
        <h2>Security & Trust</h2>
        <p>
          TonHub Exchange prioritizes security with JWT authentication, 
          encrypted data storage, withdrawal address whitelists, and 
          two-factor authentication (2FA) support. Your funds are 
          protected with industry-leading security measures.
        </p>
      </section>

      <section>
        <h2>TON Blockchain Advantages</h2>
        <p>
          Built on The Open Network (TON) blockchain, TonHub Exchange offers 
          near-instant transaction confirmations, minimal gas fees, and 
          seamless integration with TON ecosystem wallets like Tonkeeper.
        </p>
      </section>
    </article>
  );
}
