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
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '10px 14px',
  },
  labelStyle: { color: '#8b949e', fontWeight: 600, marginBottom: '6px' },
  itemStyle: { color: '#e6edf3' },
}

export default function FleetTab() {
  const latest = fleetStructure[3] // 2024
  const latestCargo = cargoAndDividend[3] // 2024

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h2 className="text-[#e6edf3] font-semibold text-sm">Fleet Strategy & Shareholder Returns</h2>
        <p className="text-[#8b949e] text-xs mt-1">
          Pacific Basin operates ~277 vessels total (112 owned + ~165 chartered). The "core fleet" tracked below
          represents owned + long-term chartered vessels. Short-term market charters are excluded.
        </p>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Owned Vessels', value: `${latest.owned}`, note: '2024 · Self-owned fleet', color: 'text-[#58a6ff]' },
          { label: 'Long-term Charter', value: `${latest.longTermCharter}`, note: '2024 · Part of core fleet', color: 'text-[#bc8cff]' },
          { label: 'Cargo Volume', value: `${latestCargo.cargoVolume}Mt`, note: '2024 · Record high', color: 'text-[#3fb950]' },
          { label: 'Dividend (2024)', value: `${latestCargo.dividend}¢`, note: 'HKD · Per share', color: 'text-[#f0883e]' },
        ].map((item, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wide">{item.label}</p>
            <p className={`text-xl font-bold mt-1 leading-tight ${item.color}`}>{item.value}</p>
            <p className="text-[#484f58] text-xs mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Fleet Composition Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">Core Fleet Composition (2021–2024)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">
            Owned vessels (solid) + long-term chartered (lighter). Trend: reducing chartered vessels,
            owned ratio improved from 85% (2021) to 89% (2024). Lower charter dependency = more stable cost base.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fleetData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
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
            <Bar dataKey="Owned" stackId="fleet" fill="#58a6ff" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Long-term Charter" stackId="fleet" fill="#bc8cff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Owned ratio table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left text-[#8b949e] py-2 pr-4">Year</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Owned</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Long-term Charter</th>
                <th className="text-right text-[#8b949e] py-2 px-4">Core Fleet</th>
                <th className="text-right text-[#8b949e] py-2 pl-4">Owned %</th>
              </tr>
            </thead>
            <tbody>
              {fleetStructure.map(f => (
                <tr key={f.year} className="border-b border-[#21262d] last:border-0">
                  <td className="text-[#e6edf3] py-2 pr-4 font-medium">{f.year}</td>
                  <td className="text-right py-2 px-4 text-[#58a6ff] font-mono">{f.owned}</td>
                  <td className="text-right py-2 px-4 text-[#bc8cff] font-mono">{f.longTermCharter}</td>
                  <td className="text-right py-2 px-4 text-[#8b949e] font-mono">{f.owned + f.longTermCharter}</td>
                  <td className="text-right py-2 pl-4 text-[#3fb950] font-mono">{f.ownedRatio}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cargo Volume & Dividend Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">Cargo Volume & Dividend per Share (2021–2024)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">
            Bars = cargo volume (Mt) on left axis. Line = dividend (HK cents/share) on right axis.
            Cargo volume grew +20% 2021→2024 despite market downturn; dividend tracks net income closely.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={cargoData} margin={{ top: 5, right: 40, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="volume"
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}Mt`}
              domain={[0, 110]}
            />
            <YAxis
              yAxisId="dividend"
              orientation="right"
              tick={{ fill: '#8b949e', fontSize: 11 }}
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
            <Bar yAxisId="volume" dataKey="Cargo Volume (Mt)" fill="#3fb950" radius={[3, 3, 0, 0]} opacity={0.8} />
            <Line
              yAxisId="dividend"
              type="monotone"
              dataKey="Dividend (HK¢)"
              stroke="#f0883e"
              strokeWidth={2.5}
              dot={{ fill: '#f0883e', r: 4 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[#484f58] text-xs mt-3">
          2022 peak dividend 78¢/share (78% payout of $702M net income).
          2023-24 dividend reduced in line with lower earnings — payout ratio maintained at ~75-83%.
        </p>
      </div>
    </div>
  )
}
