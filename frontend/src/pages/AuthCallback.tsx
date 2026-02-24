import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { initData } = useTelegramWebApp();
  const { setAuth, setLoading } = useAuthStore();

  const { data, error } = useQuery({
    queryKey: ['auth', initData],
    queryFn: () => authApi.login(initData),
    enabled: !!initData,
    retry: false,
  });

  useEffect(() => {
    if (data?.data) {
      setAuth(
        data.data.data.user,
        data.data.data.token,
        data.data.data.refreshToken
      );
      navigate('/');
    }
  }, [data, setAuth, navigate]);

  useEffect(() => {
    if (error) {
      setLoading(false);
      // In development, allow proceeding without auth
      if (import.meta.env.DEV) {
        navigate('/');
      }
    }
  }, [error, setLoading, navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ton-blue to-primary-600 flex items-center justify-center mb-4 animate-pulse">
        <span className="text-2xl">🔐</span>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
      <p className="text-gray-500 text-center">
        Authenticating with Telegram
      </p>

      {import.meta.env.DEV && (
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-dark-card rounded-lg text-sm hover:bg-dark-border transition-colors"
        >
          Continue in Dev Mode
        </button>
      )}
    </div>
  );
}
