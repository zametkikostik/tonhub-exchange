import { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData } from 'lightweight-charts';

interface PriceChartProps {
  pair: string;
}

export default function PriceChart({ pair }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#0d1117' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#30363d' },
        horzLines: { color: '#30363d' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Generate mock data (in production, fetch from API)
    const mockData = generateMockCandleData();
    candlestickSeries.setData(mockData);

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [pair]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
}

// Generate mock candlestick data for demonstration
function generateMockCandleData(): CandlestickData[] {
  const data: CandlestickData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const minute = 60;
  
  let basePrice = 5 + Math.random() * 0.5;
  
  for (let i = 100; i >= 0; i--) {
    const time = now - i * minute;
    const volatility = 0.02;
    
    const open = basePrice;
    const close = open * (1 + (Math.random() - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    
    data.push({
      time,
      open,
      high,
      low,
      close,
    });
    
    basePrice = close;
  }
  
  return data;
}
