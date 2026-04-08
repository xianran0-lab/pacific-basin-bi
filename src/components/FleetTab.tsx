import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fleetStructure, cargoAndDividend, annualData } from '../data/pbHistoricalData'

const fleetData = fleetStructure.map(f => {
  const annual = annualData.find(a => a.year === f.year)!
  return {
    year: f.year.toString(),
    'Owned': f.owned,
    'Long-term Charter': f.longTermCharter,
    'Core Fleet Total': annual.coreFleet,
  }
})

const cargoData = cargoAndDividend.map(d => ({
  year: d.year.toString(),
  'Cargo Volume (Mt)': d.cargoVolume,
  'Dividend (HK¢)': d.dividend,
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

export default function FleetTab() {
  const latest = fleetStructure[3] // 2024
  const latestCargo = cargoAndDividend[3] // 2024

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
          Fleet Strategy & Shareholder Returns
        </h2>
        <p 
          className="text-xs mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Pacific Basin operates ~277 vessels total (112 owned + ~165 chartered). The "core fleet" tracked below
          represents owned + long-term chartered vessels. Short-term market charters are excluded.
        </p>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Owned Vessels', value: `${latest.owned}`, note: '2024 · Self-owned fleet', color: 'var(--accent-blue)' },
          { label: 'Long-term Charter', value: `${latest.longTermCharter}`, note: '2024 · Part of core fleet', color: 'var(--accent-purple)' },
          { label: 'Cargo Volume', value: `${latestCargo.cargoVolume}Mt`, note: '2024 · Record high', color: 'var(--accent-green)' },
          { label: 'Dividend (2024)', value: `${latestCargo.dividend}¢`, note: 'HKD · Per share', color: 'var(--accent-orange)' },
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
              className="text-xl font-bold mt-1 leading-tight"
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

      {/* Fleet Composition Chart */}
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
            Core Fleet Composition (2021–2024)
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Owned vessels (solid) + long-term chartered (lighter). Trend: reducing chartered vessels,
            owned ratio improved from 85% (2021) to 89% (2024). Lower charter dependency = more stable cost base.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fleetData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
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
              tickFormatter={(v: number) => `${v} vessels`}
              domain={[0, 160]}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => `${value} vessels`}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Bar dataKey="Owned" stackId="fleet" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Long-term Charter" stackId="fleet" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Owned ratio table */}
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
                  Owned
                </th>
                <th 
                  className="text-right py-2 px-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Long-term Charter
                </th>
                <th 
                  className="text-right py-2 px-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Core Fleet
                </th>
                <th 
                  className="text-right py-2 pl-4 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Owned %
                </th>
              </tr>
            </thead>
            <tbody>
              {fleetStructure.map(f => (
                <tr 
                  key={f.year} 
                  style={{ borderBottom: '1px solid var(--border-primary)' }}
                  className="last:border-0"
                >
                  <td 
                    className="py-2 pr-4 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {f.year}
                  </td>
                  <td 
                    className="text-right py-2 px-4 font-mono"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    {f.owned}
                  </td>
                  <td 
                    className="text-right py-2 px-4 font-mono"
                    style={{ color: 'var(--accent-orange)' }}
                  >
                    {f.longTermCharter}
                  </td>
                  <td 
                    className="text-right py-2 px-4 font-mono"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {f.owned + f.longTermCharter}
                  </td>
                  <td 
                    className="text-right py-2 pl-4 font-mono"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    {f.ownedRatio}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cargo Volume & Dividend Chart */}
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
            Cargo Volume & Dividend per Share (2021–2024)
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Bars = cargo volume (Mt) on left axis. Line = dividend (HK cents/share) on right axis.
            Cargo volume grew +20% 2021→2024 despite market downturn; dividend tracks net income closely.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={cargoData} margin={{ top: 5, right: 40, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#737373', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis
              yAxisId="volume"
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}Mt`}
              domain={[0, 110]}
            />
            <YAxis
              yAxisId="dividend"
              orientation="right"
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}¢`}
              domain={[0, 100]}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, name) =>
                (name as string) === 'Dividend (HK¢)'
                  ? `${(value as number)}¢/share`
                  : `${(value as number)}Mt`
              }
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Bar 
              yAxisId="volume" 
              dataKey="Cargo Volume (Mt)" 
              fill="#10b981" 
              radius={[3, 3, 0, 0]} 
              opacity={0.8} 
            />
            <Line
              yAxisId="dividend"
              type="monotone"
              dataKey="Dividend (HK¢)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p 
          className="text-xs mt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          2022 peak dividend 78¢/share (78% payout of $702M net income).
          2023-24 dividend reduced in line with lower earnings — payout ratio maintained at ~75-83%.
        </p>
      </div>
    </div>
  )
}
