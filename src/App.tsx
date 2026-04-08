import { useState } from 'react'
import OverviewTab from './components/OverviewTab'
import MarketTab from './components/MarketTab'
import CostTab from './components/CostTab'
import FleetTab from './components/FleetTab'

type TabId = 'overview' | 'market' | 'cost' | 'fleet'

const tabs: Array<{ id: TabId; label: string; subtitle: string }> = [
  { id: 'overview', label: 'Overview', subtitle: 'Financial Summary' },
  { id: 'market', label: 'Market Intelligence', subtitle: 'TCE & Index' },
  { id: 'cost', label: 'Cost & Profitability', subtitle: 'Margin Analysis' },
  { id: 'fleet', label: 'Fleet Strategy', subtitle: 'Structure & Returns' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <header className="bg-[#010409] border-b border-[#30363d]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#1f6feb] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              PB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[#e6edf3] font-semibold text-lg leading-none">
                  Pacific Basin Shipping
                </h1>
                <span className="text-xs bg-[#1f6feb1a] text-[#58a6ff] border border-[#1f6feb66] px-2 py-0.5 rounded-full">
                  2343.HK
                </span>
              </div>
              <p className="text-[#8b949e] text-xs mt-1">
                Dry Bulk Carrier · Handysize & Supramax · BI Dashboard
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[#e6edf3] text-sm font-medium">2024 Annual Report Data</p>
            <p className="text-[#8b949e] text-xs mt-0.5">
              277 vessels · 6 continents · 600+ customers
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-[#010409] border-b border-[#30363d]">
        <div className="max-w-[1400px] mx-auto px-6 flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#f0883e] text-[#e6edf3]'
                  : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'
              }`}
            >
              {tab.label}
              <span className="hidden md:inline text-[#484f58] text-xs ml-1.5">
                · {tab.subtitle}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'market' && <MarketTab />}
        {activeTab === 'cost' && <CostTab />}
        {activeTab === 'fleet' && <FleetTab />}
      </main>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-6 pb-8 mt-4">
        <div className="border-t border-[#21262d] pt-4 flex flex-wrap gap-4 justify-between text-xs text-[#484f58]">
          <p>Data sources: Pacific Basin Annual Reports 2021–2024 · Baltic Exchange BHSI/BSI Index</p>
          <p>Portfolio project · Not investment advice</p>
        </div>
      </footer>
    </div>
  )
}
