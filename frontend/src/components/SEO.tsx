import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://tonhub-exchange.vercel.app';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  image = '/og-image.png',
  url,
  type = 'website',
}: SEOProps) {
  const location = useLocation();
  const currentUrl = url ? `${BASE_URL}${url}` : `${BASE_URL}${location.pathname}`;

  const defaultTitle = 'TonHub Exchange — Trade Crypto on TON Blockchain | Telegram Mini App';
  const defaultDescription = 'Trade cryptocurrency directly in Telegram with TonHub Exchange. Fast, secure spot trading on TON blockchain. Low fees, real-time charts, instant deposits.';

  const pageTitle = title ? `${title} | TonHub Exchange` : defaultTitle;
  const pageDescription = description || defaultDescription;

  // Page-specific structured data
  const getPageSchema = () => {
    if (location.pathname === '/trade') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Trade Cryptocurrency | TonHub Exchange',
        description: 'Real-time cryptocurrency trading with advanced charts, order book, and instant execution on TON blockchain.',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Trade', item: `${BASE_URL}/trade` },
          ],
        },
      };
    }

    if (location.pathname === '/wallet') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Crypto Wallet | TonHub Exchange',
        description: 'Manage your cryptocurrency wallet. Deposit and withdraw TON, USDT, BTC securely with instant blockchain confirmations.',
      };
    }

    return null;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content="crypto exchange, TON trading, Telegram trading, cryptocurrency, TON blockchain, spot trading, buy TON, sell crypto, USDT, BTC trading, low fee exchange, decentralized trading, Tonkeeper" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={`${BASE_URL}${image}`} />
      <meta property="og:site_name" content="TonHub Exchange" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${BASE_URL}${image}`} />
      <meta name="twitter:creator" content="@TonHubExchange" />

      {/* Telegram */}
      <meta name="tg:site" content="tonhub_exchange" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="Global" />
      <meta name="geo.position" content="0;0" />
      <meta name="ICBM" content="0, 0" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="TonHub Exchange" />
      <meta name="publisher" content="TonHub Exchange" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="yandex" content="index, follow" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="en" />
      
      {/* Rating */}
      <meta name="rating" content="general" />
      <meta name="age-rating" content="0" />

      {/* Structured Data */}
      {getPageSchema() && (
        <script type="application/ld+json">
          {JSON.stringify(getPageSchema())}
        </script>
      )}

      {/* Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://telegram.org" />
      <link rel="preconnect" href="https://toncenter.com" />
    </Helmet>
  );
}
