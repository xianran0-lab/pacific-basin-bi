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
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '10px 14px',
  },
  labelStyle: { color: '#8b949e', fontWeight: 600, marginBottom: '6px' },
  itemStyle: { color: '#e6edf3' },
}

export default function CostTab() {
  const cost2024 = costAnalysis[3]
  const y2024 = annualData[3]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h2 className="text-[#e6edf3] font-semibold text-sm">Cost Structure & Profitability</h2>
        <p className="text-[#8b949e] text-xs mt-1">
          Safety margin = TCE − All-in Breakeven. As long as TCE exceeds ~$9,820/day (2024 breakeven),
          Pacific Basin remains profitable on every operating day.
        </p>
      </div>

      {/* 2024 Cost Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'OPEX / Day', value: `$${cost2024.opexPerDay.toLocaleString()}`, note: 'Ship operating costs', color: 'text-[#f85149]' },
          { label: 'Handysize Breakeven', value: `$${cost2024.handysizeBreakeven.toLocaleString()}/day`, note: 'All costs included', color: 'text-[#8b949e]' },
          { label: 'Supramax Breakeven', value: `$${cost2024.supramaxBreakeven.toLocaleString()}/day`, note: 'All costs included', color: 'text-[#8b949e]' },
          { label: 'Handysize Safety', value: `+$${cost2024.handysizeProfit.toLocaleString()}/day`, note: `vs TCE $${y2024.handysizeTce.toLocaleString()}`, color: 'text-[#3fb950]' },
        ].map((item, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wide">{item.label}</p>
            <p className={`text-lg font-bold mt-1 leading-tight ${item.color}`}>{item.value}</p>
            <p className="text-[#484f58] text-xs mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Safety Margin Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">Profitability Safety Margin (TCE − Breakeven)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">
            USD/day per vessel. 2021-22 super-cycle margins were extraordinary; 2023-24 normalized but remain positive.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={safetyData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => `+$${(value as number).toLocaleString()}/day`}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="#30363d" strokeWidth={1.5} />
            <Bar dataKey="Handysize Margin" fill="#58a6ff" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Supramax Margin" fill="#f0883e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TCE vs Breakeven Trend */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">TCE vs Breakeven & OPEX Trend (Handysize)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">
            Solid line = actual TCE earned. Dashed line = all-in breakeven. Dotted = daily OPEX.
            The gap between TCE and breakeven is profit per vessel per day.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={costTrendData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
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
              stroke="#58a6ff"
              strokeWidth={2.5}
              dot={{ fill: '#58a6ff', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Handysize Breakeven"
              stroke="#58a6ff"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={{ fill: '#58a6ff', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="OPEX/Day"
              stroke="#f85149"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={{ fill: '#f85149', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[#484f58] text-xs mt-3">
          Note: Supramax TCE is excluded from this chart for readability (2021-22 values of $28-29K would compress the scale).
          Supramax shows similar pattern — breakeven ~$9,720-10,950/day, TCE peaked at $29,350/day in 2021.
        </p>
      </div>
    </div>
  )
}
