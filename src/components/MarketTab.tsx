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

export default function MarketTab() {
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
          TCE vs Market Index Overview
        </h2>
        <p 
          className="text-xs mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Pacific Basin's TCE (Time Charter Equivalent) versus Baltic Exchange benchmarks.
          A positive premium means PB earns more per vessel per day than the market average.
        </p>
      </div>

      {/* Two TCE comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Handysize */}
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
              Handysize: PB TCE vs BHSI Index
            </h2>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              USD/day · 2024 premium: +$1,720/day (+0.9%)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={handysizeData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
                dataKey="PB Handysize"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="BHSI Index"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: '#0284c7', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Supramax */}
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
              Supramax: PB TCE vs BSI Index
            </h2>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              USD/day · 2024 underperformed: -$640/day (-4.5%) — first time since 2021
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={supramaxData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
                dataKey="PB Supramax"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="BSI Index"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: '#d97706', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TCE Premium Chart */}
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
            TCE Premium vs Market Index (USD/day)
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            How much PB earns above (positive) or below (negative) the market index per vessel per day.
            2022 was peak alpha: Handysize +$5,210/day (+28.6%), Supramax +$7,080/day (+33.7%).
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={premiumData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => { const v = value as number; return `${v >= 0 ? '+' : ''}$${v.toLocaleString()}/day` }}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="#d4d4d4" strokeWidth={1.5} />
            <Bar dataKey="Handysize Premium" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Supramax Premium" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Premium table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th 
                  className="text-left py-2 pr-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Year
                </th>
                <th 
                  className="text-right py-2 px-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Handysize Premium
                </th>
                <th 
                  className="text-right py-2 px-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Handysize %
                </th>
                <th 
                  className="text-right py-2 px-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Supramax Premium
                </th>
                <th 
                  className="text-right py-2 pl-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Supramax %
                </th>
              </tr>
            </thead>
            <tbody>
              {tceOutperformance.map(d => (
                <tr 
                  key={d.year} 
                  style={{ borderBottom: '1px solid var(--border-primary)' }}
                  className="last:border-0"
                >
                  <td 
                    className="py-2 pr-4 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {d.year}
                  </td>
                  <td 
                    className={`text-right py-2 px-4 font-mono ${d.handysizeOutperform >= 0 ? '' : ''}`}
                    style={{ 
                      color: d.handysizeOutperform >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}
                  >
                    {d.handysizeOutperform >= 0 ? '+' : ''}${d.handysizeOutperform.toLocaleString()}
                  </td>
                  <td 
                    className="text-right py-2 px-4 font-mono"
                    style={{ 
                      color: d.handysizeOutperformPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}
                  >
                    {d.handysizeOutperformPct >= 0 ? '+' : ''}{d.handysizeOutperformPct}%
                  </td>
                  <td 
                    className="text-right py-2 px-4 font-mono"
                    style={{ 
                      color: d.supramaxOutperform >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}
                  >
                    {d.supramaxOutperform >= 0 ? '+' : ''}${d.supramaxOutperform.toLocaleString()}
                  </td>
                  <td 
                    className="text-right py-2 pl-4 font-mono"
                    style={{ 
                      color: d.supramaxOutperformPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}
                  >
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
