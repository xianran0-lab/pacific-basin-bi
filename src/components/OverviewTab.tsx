import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { annualData, summaryMetrics, costAnalysis } from '../data/pbHistoricalData'

const chartData = annualData.map(d => ({
  year: d.year.toString(),
  Revenue: d.revenue,
  EBITDA: d.ebitda,
  'Net Income': d.netIncome,
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

export default function OverviewTab() {
  const y2024 = annualData[3]
  const y2023 = annualData[2]
  const cost2024 = costAnalysis[3]

  const revenueChg = ((y2024.revenue - y2023.revenue) / y2023.revenue * 100).toFixed(1)
  const netIncomeChg = ((y2024.netIncome - y2023.netIncome) / y2023.netIncome * 100).toFixed(1)

  const kpis = [
    {
      label: 'Revenue',
      value: '$2.58B',
      badge: `+${revenueChg}% YoY`,
      positive: true,
      note: '2024 Full Year',
    },
    {
      label: 'Net Income',
      value: '$132M',
      badge: `+${netIncomeChg}% YoY`,
      positive: true,
      note: 'ROE 7% · EPS 19.9¢',
    },
    {
      label: 'EBITDA',
      value: '$333M',
      badge: '12.9% margin',
      positive: true,
      note: '2024 Full Year',
    },
    {
      label: 'Handysize TCE',
      value: '$12,840/day',
      badge: '+$1,720 vs BHSI',
      positive: true,
      note: 'Market outperformance',
    },
    {
      label: 'Safety Margin',
      value: `$${cost2024.handysizeProfit.toLocaleString()}/day`,
      badge: 'above breakeven',
      positive: true,
      note: `Breakeven $${cost2024.handysizeBreakeven.toLocaleString()}/day`,
    },
    {
      label: '4-Year Revenue',
      value: `$${(summaryMetrics.totalRevenue / 1000).toFixed(1)}B`,
      badge: `$${(summaryMetrics.totalNetIncome / 1000).toFixed(2)}B net income`,
      positive: true,
      note: '2021–2024 cumulative',
    },
  ]

  const insights = [
    '2021-2022超级周期推动净利润超$10亿，2023-24年回归常态后仍保持盈利',
    '四年累计收入$111.3亿、净利润$17.9亿，体现穿越周期的盈利韧性',
    '2024年股东回报约$1.01亿（净利润的83%），包含回购$4,000万',
    '2024年末净现金$1,970万，可用流动性$5.48亿，资产负债表健康',
    'EBITDA margin从2021年34.5%降至2024年12.9%，反映市场正常化',
    '2024年盈亏平衡TCE $8,820/天，实际$12,840/天，安全垫$4,020/天',
  ]

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wide">{kpi.label}</p>
            <p className="text-[#e6edf3] text-xl font-bold mt-1 leading-tight">{kpi.value}</p>
            <span className={`text-xs font-medium mt-1 inline-block ${kpi.positive ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
              {kpi.badge}
            </span>
            <p className="text-[#484f58] text-xs mt-0.5">{kpi.note}</p>
          </div>
        ))}
      </div>

      {/* Revenue / Profit Trend */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="mb-4">
          <h2 className="text-[#e6edf3] font-semibold text-sm">Revenue, EBITDA & Net Income (2021–2024)</h2>
          <p className="text-[#8b949e] text-xs mt-0.5">USD million — Super-cycle peak (2021–22) → Market normalization (2023–24)</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString()}M`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => `$${(value as number).toFixed(0)}M`}
            />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Bar dataKey="Revenue" fill="#58a6ff" radius={[3, 3, 0, 0]} />
            <Bar dataKey="EBITDA" fill="#3fb950" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Net Income" fill="#f0883e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h2 className="text-[#e6edf3] font-semibold text-sm mb-3">Key Insights</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-[#58a6ff] mt-0.5 flex-shrink-0">›</span>
              <span className="text-[#8b949e]">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
