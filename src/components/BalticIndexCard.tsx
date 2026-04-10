import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface BalticIndexCardProps {
  title: string;
  subtitle: string;
  unit?: string;
  values: Array<{ year: number; value: number }>;
  color?: string;
}

export default function BalticIndexCard({
  title,
  subtitle,
  unit = '$/day',
  values,
  color = 'var(--accent-blue)',
}: BalticIndexCardProps) {
  const latest = values[values.length - 1];
  const prev = values[values.length - 2];
  const change = latest.value - prev.value;
  const changePct = prev.value > 0 ? (change / prev.value) * 100 : 0;
  const isPositive = change >= 0;

  const chartData = values.map(d => ({ year: d.year.toString(), value: d.value }));

  return (
    <div
      className="rounded-lg p-5 card-hover"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="mb-3">
        <h2 style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>
      </div>

      {/* Value + Change */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {latest.value.toLocaleString()}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
        >
          {isPositive ? '+' : ''}
          {change.toLocaleString()} ({isPositive ? '+' : ''}
          {changePct.toFixed(1)}%)
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        {unit} · {latest.year} annual avg · vs {prev.year}
      </p>

      {/* Sparkline */}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="year"
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(v) => [`${(v as number).toLocaleString()} ${unit}`, title]}
            labelFormatter={(label) => `Year ${label}`}
          />
          <ReferenceLine
            y={latest.value}
            stroke={color}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div
        className="mt-3 pt-3 border-t text-xs"
        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
      >
        Source: PB Annual Report 2024
      </div>
    </div>
  );
}
