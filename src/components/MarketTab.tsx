import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { annualData, tceOutperformance } from '../data/pbHistoricalData'

const handysizeData = annualData.map(d => ({
  year: d.year.toString(),
  'PB Handysize': d.handysizeTce,
  'BHSI Index': d.bhsiIndex,
}))

const supramaxData = annualData.map(d => ({
  year: d.year.toString(),
  'PB Supramax': d.supramaxTce,
  'BSI Index': d.bsiIndex,
}))

const premiumData = tceOutperformance.map(d => ({
  year: d.year.toString(),
  'Handysize Premium': d.handysizeOutperform,
  'Supramax Premium': d.supramaxOutperform,
}))

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

export default function MarketTab() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h2 className="text-[#e6edf3] font-semibold text-sm">TCE vs Market Index Overview</h2>
        <p className="text-[#8b949e] text-xs mt-1">
          Pacific Basin's TCE (Time Charter Equivalent) versus Baltic Exchange benchmarks.
          A positive premium means PB earns more per vessel per day than the market average.
        </p>
      </div>

      {/* Two TCE comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Handysize */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-[#e6edf3] font-semibold text-sm">Handysize: PB TCE vs BHSI Index</h2>
            <p className="text-[#8b949e] text-xs mt-0.5">USD/day · 2024 premium: +$1,720/day (+0.9%)</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={handysizeData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
                dataKey="PB Handysize"
                stroke="#58a6ff"
                strokeWidth={2.5}
                dot={{ fill: '#58a6ff', r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="BHSI Index"
                stroke="#388bfd"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: '#388bfd', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Supramax */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-[#e6edf3] font-semibold text-sm">Supramax: PB TCE vs BSI Index</h2>
            <p className="text-[#8b949e] text-xs mt-0.5">USD/day · 2024 underperformed: -$640/day (-4.5%) — first time since 2021</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={supramaxData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
                dataKey="PB Supramax"
                stroke="#f0883e"
                strokeWidth={2.5}
                dot={{ fill: '#f0883e', r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="BSI Index"
                stroke="#db6d28"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: '#db6d28', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TCE Premium Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">TCE Premium vs Market Index (USD/day)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">
            How much PB earns above (positive) or below (negative) the market index per vessel per day.
            2022 was peak alpha: Handysize +$5,210/day (+28.6%), Supramax +$7,080/day (+33.7%).
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={premiumData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => { const v = value as number; return `${v >= 0 ? '+' : ''}$${v.toLocaleString()}/day` }}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="#30363d" strokeWidth={1.5} />
            <Bar dataKey="Handysize Premium" fill="#58a6ff" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Supramax Premium" fill="#f0883e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Premium table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left text-[#8b949e] py-2 pr-4">Year</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Handysize Premium</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Handysize %</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Supramax Premium</th>
                <th className="text-right text-[#8b949e] py-2 pl-4">Supramax %</th>
              </tr>
            </thead>
            <tbody>
              {tceOutperformance.map(d => (
                <tr key={d.year} className="border-b border-[#21262d] last:border-0">
                  <td className="text-[#e6edf3] py-2 pr-4 font-medium">{d.year}</td>
                  <td className={`text-right py-2 px-4 font-mono ${d.handysizeOutperform >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {d.handysizeOutperform >= 0 ? '+' : ''}${d.handysizeOutperform.toLocaleString()}
                  </td>
                  <td className={`text-right py-2 px-4 font-mono ${d.handysizeOutperformPct >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {d.handysizeOutperformPct >= 0 ? '+' : ''}{d.handysizeOutperformPct}%
                  </td>
                  <td className={`text-right py-2 px-4 font-mono ${d.supramaxOutperform >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {d.supramaxOutperform >= 0 ? '+' : ''}${d.supramaxOutperform.toLocaleString()}
                  </td>
                  <td className={`text-right py-2 pl-4 font-mono ${d.supramaxOutperformPct >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {d.supramaxOutperformPct >= 0 ? '+' : ''}{d.supramaxOutperformPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
