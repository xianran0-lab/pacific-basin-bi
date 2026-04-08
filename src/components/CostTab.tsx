import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { annualData, costAnalysis } from '../data/pbHistoricalData'

const safetyData = costAnalysis.map(d => ({
  year: d.year.toString(),
  'Handysize Margin': d.handysizeProfit,
  'Supramax Margin': d.supramaxProfit,
}))

const costTrendData = costAnalysis.map(d => {
  const annual = annualData.find(a => a.year === d.year)!
  return {
    year: d.year.toString(),
    'Handysize TCE': annual.handysizeTce,
    'Handysize Breakeven': d.handysizeBreakeven,
    'Supramax TCE': annual.supramaxTce,
    'Supramax Breakeven': d.supramaxBreakeven,
    'OPEX/Day': d.opexPerDay,
  }
})

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '10px 14px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  labelStyle: { color: '#525252', fontWeight: 600, marginBottom: '6px' },
  itemStyle: { color: '#171717' },
}

export default function CostTab() {
  const cost2024 = costAnalysis[3]
  const y2024 = annualData[3]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div 
        className="rounded-lg p-4 card-hover"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h2 style={{ color: 'var(--text-primary)' }}>
          Cost Structure & Profitability
        </h2>
        <p 
          className="text-xs mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Safety margin = TCE − All-in Breakeven. As long as TCE exceeds ~$9,820/day (2024 breakeven),
          Pacific Basin remains profitable on every operating day.
        </p>
      </div>

      {/* 2024 Cost Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'OPEX / Day', value: `$${cost2024.opexPerDay.toLocaleString()}`, note: 'Ship operating costs', color: 'var(--accent-red)' },
          { label: 'Handysize Breakeven', value: `$${cost2024.handysizeBreakeven.toLocaleString()}/day`, note: 'All costs included', color: 'var(--text-tertiary)' },
          { label: 'Supramax Breakeven', value: `$${cost2024.supramaxBreakeven.toLocaleString()}/day`, note: 'All costs included', color: 'var(--text-tertiary)' },
          { label: 'Handysize Safety', value: `+$${cost2024.handysizeProfit.toLocaleString()}/day`, note: `vs TCE $${y2024.handysizeTce.toLocaleString()}`, color: 'var(--accent-green)' },
        ].map((item, i) => (
          <div 
            key={i} 
            className="rounded-lg p-4 card-hover cursor-default"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <p 
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {item.label}
            </p>
            <p 
              className="text-lg font-bold mt-1 leading-tight"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
            <p 
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.note}
            </p>
          </div>
        ))}
      </div>

      {/* Safety Margin Chart */}
      <div 
        className="rounded-lg p-5 card-hover"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="mb-4">
          <h2 style={{ color: 'var(--text-primary)' }}>
            Profitability Safety Margin (TCE − Breakeven)
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            USD/day per vessel. 2021-22 super-cycle margins were extraordinary; 2023-24 normalized but remain positive.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={safetyData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#737373', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => `+$${(value as number).toLocaleString()}/day`}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="#d4d4d4" strokeWidth={1.5} />
            <Bar dataKey="Handysize Margin" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Supramax Margin" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TCE vs Breakeven Trend */}
      <div 
        className="rounded-lg p-5 card-hover"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="mb-4">
          <h2 style={{ color: 'var(--text-primary)' }}>
            TCE vs Breakeven & OPEX Trend (Handysize)
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Solid line = actual TCE earned. Dashed line = all-in breakeven. Dotted = daily OPEX.
            The gap between TCE and breakeven is profit per vessel per day.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={costTrendData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#737373', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => `$${(value as number).toLocaleString()}/day`}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="Handysize TCE"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ fill: '#0ea5e9', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Handysize Breakeven"
              stroke="#0ea5e9"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={{ fill: '#0ea5e9', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="OPEX/Day"
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={{ fill: '#ef4444', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p 
          className="text-xs mt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Note: Supramax TCE is excluded from this chart for readability (2021-22 values of $28-29K would compress the scale).
          Supramax shows similar pattern — breakeven ~$9,720-10,950/day, TCE peaked at $29,350/day in 2021.
        </p>
      </div>
    </div>
  )
}
