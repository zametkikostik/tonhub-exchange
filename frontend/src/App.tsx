import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TradePage from './pages/TradePage';
import WalletPage from './pages/WalletPage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallback from './pages/AuthCallback';
import SEO from './components/SEO';

function App() {
  return (
    <HelmetProvider>
      <SEO />
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="trade" element={<TradePage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}

export default App;
