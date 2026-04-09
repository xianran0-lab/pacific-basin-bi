import { useState } from 'react'
import OverviewTab from './components/OverviewTab'
import MarketTab from './components/MarketTab'
import CostTab from './components/CostTab'
import FleetTab from './components/FleetTab'
import HKMarineTab from './components/HKMarineTab'

type TabId = 'overview' | 'market' | 'cost' | 'fleet' | 'hk-marine'

interface Tab {
  id: TabId
  label: string
  shortLabel: string
  subtitle: string
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', subtitle: 'Financial Summary' },
  { id: 'market', label: 'Market', shortLabel: 'Market', subtitle: 'TCE & Index' },
  { id: 'cost', label: 'Cost', shortLabel: 'Cost', subtitle: 'Margin Analysis' },
  { id: 'fleet', label: 'Fleet', shortLabel: 'Fleet', subtitle: 'Structure & Returns' },
  { id: 'hk-marine', label: 'HK Marine', shortLabel: 'HK Port', subtitle: 'Port Intelligence' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <header 
        className="border-b sticky top-0 z-50 transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm transition-transform duration-150 hover:scale-105"
                style={{ backgroundColor: 'var(--accent-blue)' }}
              >
                PB
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 
                    className="font-semibold text-base sm:text-lg leading-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Pacific Basin Shipping
                  </h1>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ 
                      backgroundColor: 'rgba(14, 165, 233, 0.1)',
                      color: 'var(--accent-blue-dark)',
                      border: '1px solid rgba(14, 165, 233, 0.2)'
                    }}
                  >
                    2343.HK
                  </span>
                </div>
                <p 
                  className="text-xs mt-0.5 truncate"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Dry Bulk Carrier · Handysize & Supramax · BI Dashboard
                </p>
              </div>
            </div>

            {/* Header Stats - Hidden on small mobile */}
            <div className="hidden sm:block text-right flex-shrink-0">
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                2024 Annual Report Data
              </p>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                277 vessels · 6 continents · 600+ customers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        <nav 
          className="border-t overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex -mb-px overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus:outline-none flex-shrink-0"
                  style={{
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-orange)' : 'transparent'}`,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'var(--text-tertiary)'
                    }
                  }}
                >
                  {/* Short label on mobile, full label on larger screens */}
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span 
                    className="hidden md:inline text-xs ml-1.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    · {tab.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main 
        className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 tab-content"
        style={{ color: 'var(--text-primary)' }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'market' && <MarketTab />}
        {activeTab === 'cost' && <CostTab />}
        {activeTab === 'fleet' && <FleetTab />}
        {activeTab === 'hk-marine' && <HKMarineTab />}
      </main>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-8 mt-4">
        <div 
          className="border-t pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between text-xs"
          style={{ 
            borderColor: 'var(--border-primary)',
            color: 'var(--text-muted)'
          }}
        >
          <p>Data sources: Pacific Basin Annual Reports 2021–2024 · Baltic Exchange BHSI/BSI Index</p>
          <p className="flex-shrink-0">Portfolio project · Not investment advice</p>
        </div>
      </footer>
    </div>
  )
}
