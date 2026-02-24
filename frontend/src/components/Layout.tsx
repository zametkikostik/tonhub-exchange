import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/trade', label: 'Trade', icon: '📊' },
  { path: '/wallet', label: 'Wallet', icon: '💼' },
  { path: '/orders', label: 'Orders', icon: '📋' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ton-blue to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TH</span>
          </div>
          <span className="font-semibold text-lg">TonHub</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium">{user.username || 'User'}</div>
              <div className="text-xs text-gray-500">
                {user.tonWalletAddress 
                  ? `${user.tonWalletAddress.slice(0, 6)}...${user.tonWalletAddress.slice(-4)}`
                  : 'No wallet'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-dark-border bg-dark-card safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-ton-blue'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
