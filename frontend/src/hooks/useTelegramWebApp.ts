import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          text_color: string;
          isVisible: boolean;
          isActive: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          query_id?: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        onEvent: (event: string, callback: (...args: any[]) => void) => void;
        offEvent: (event: string, callback: (...args: any[]) => void) => void;
        close: () => void;
        switchInlineQuery: (query: string) => void;
      };
    };
  }
}

export function useTelegramWebApp() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Tell Telegram that app is ready
      tg.ready();
      
      // Expand to full height
      tg.expand();
      
      // Set color scheme based on Telegram theme
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        tg.themeParams.bg_color || '#0d1117'
      );
      
      console.log('Telegram WebApp initialized:', {
        user: tg.initDataUnsafe?.user,
        colorScheme: tg.colorScheme,
      });
    }

    return () => {
      if (tg) {
        tg.offEvent('themeChanged', () => {});
      }
    };
  }, []);

  return {
    initData: window.Telegram?.WebApp.initData || '',
    user: window.Telegram?.WebApp.initDataUnsafe?.user,
    isDark: window.Telegram?.WebApp.colorScheme === 'dark',
  };
}
