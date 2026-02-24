interface PriceChartProps {
  pair: string;
}

// Temporarily disabled - lightweight-charts compatibility issue
export default function PriceChart({ pair: _pair }: PriceChartProps) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      color: '#8b949e'
    }}>
      📈 Chart coming soon...
    </div>
  );
}
