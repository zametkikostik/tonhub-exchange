import { useAuthStore } from '../store/authStore';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { user: tgUser } = useTelegramWebApp();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/callback';
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Profile Section */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Profile</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Username</span>
            <span>{user?.username || tgUser?.username || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Telegram ID</span>
            <span className="font-mono">{user?.telegramId || tgUser?.id || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Referral Code</span>
            <span className="font-mono text-ton-blue">{user?.referralCode || '-'}</span>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Security</h3>
        
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Two-Factor Auth</div>
              <div className="text-xs text-gray-500">Not enabled</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Withdrawal Whitelist</div>
              <div className="text-xs text-gray-500">Manage addresses</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Change Password</div>
              <div className="text-xs text-gray-500">Update your password</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Preferences</h3>
        
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Language</div>
              <div className="text-xs text-gray-500">English</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Currency</div>
              <div className="text-xs text-gray-500">USD</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Notifications</div>
              <div className="text-xs text-gray-500">Manage alerts</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
        </div>
      </div>

      {/* Support Section */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Support</h3>
        
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Help Center</div>
              <div className="text-xs text-gray-500">FAQs and guides</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors">
            <div className="text-left">
              <div className="font-medium text-sm">Contact Support</div>
              <div className="text-xs text-gray-500">Get help</div>
            </div>
            <span className="text-gray-500">→</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-lg bg-red-500/20 text-red-500 font-medium hover:bg-red-500/30 transition-colors"
      >
        Logout
      </button>

      {/* App Version */}
      <div className="text-center text-xs text-gray-600">
        TonHub Exchange v1.0.0
      </div>
    </div>
  );
}
