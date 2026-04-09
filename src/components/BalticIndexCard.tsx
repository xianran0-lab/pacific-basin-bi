import { useBalticIndices } from '../hooks/useBalticIndices';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface BalticIndexCardProps {
  symbol?: string;
  title?: string;
}

export default function BalticIndexCard({ 
  symbol = '^bdi', 
  title = 'Baltic Dry Index (BDI)' 
}: BalticIndexCardProps) {
  const { data, loading, error, refetch } = useBalticIndices(symbol);

  if (loading) {
    return (
      <div 
        className="rounded-lg p-5 animate-pulse"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <div className="h-4 w-32 mb-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-8 w-24 mb-2 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-64 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div 
        className="rounded-lg p-5"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <h2 style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ color: 'var(--accent-red)' }} className="mt-2">
          Error loading data: {error}
        </p>
        <button
          onClick={refetch}
          className="mt-3 px-3 py-1.5 rounded text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--accent-blue)',
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isDemo = data.demo || data.fallback;
  const lastUpdate = data.fetchedAt || data.cachedAt;
  const change = data.history.length > 1 
    ? data.close - data.history[data.history.length - 2].close 
    : 0;
  const changePercent = data.history.length > 1 && data.history[data.history.length - 2].close !== 0
    ? (change / data.history[data.history.length - 2].close) * 100 
    : 0;
  const isPositive = change >= 0;

  return (
    <div 
      className="rounded-lg p-5 card-hover"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {symbol === '^bdi' ? 'Dry Bulk Freight Index' : 
             symbol === '^bsi' ? 'Supramax Index' : 'Handysize Index'}
          </p>
        </div>
        <div className="text-right">
          {isDemo && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--accent-orange)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              Demo Data
            </span>
          )}
          {data.cached && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full ml-2"
              style={{ 
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(14, 165, 233, 0.2)'
              }}
            >
              Cached
            </span>
          )}
        </div>
      </div>

      {/* Price Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span 
            className="text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {data.close.toLocaleString()}
          </span>
          <span 
            className="text-sm font-medium"
            style={{ 
              color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
            }}
          >
            {isPositive ? '+' : ''}{change.toFixed(0)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
        <p 
          className="text-xs mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {data.date} • Updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Unknown'}
          {data.error && (
            <span className="ml-2" style={{ color: 'var(--accent-orange)' }}>
              (Live data unavailable)
            </span>
          )}
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data.history}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'var(--text-tertiary)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [String(value), 'Close']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <ReferenceLine 
            y={data.close} 
            stroke="var(--accent-orange)" 
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--accent-blue)' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div 
        className="mt-3 pt-3 border-t text-xs flex justify-between items-center"
        style={{ 
          borderColor: 'var(--border-primary)',
          color: 'var(--text-muted)'
        }}
      >
        <span>Source: {isDemo ? 'Demo data based on historical averages' : 'stooq.com'}</span>
        <button
          onClick={refetch}
          className="hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
