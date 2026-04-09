import { useState } from 'react';
import { useHKMarineData } from '../hooks/useHKMarineData';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function HKMarineTab() {
  const [filter, setFilter] = useState('all');
  const { vessels, stats, loading, error, refetch } = useHKMarineData('current', filter, 24);

  // Filter vessels for display
  const filteredVessels = vessels.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'bulk') return v.ship_type?.toLowerCase().includes('bulk');
    if (filter === 'container') return v.ship_type?.toLowerCase().includes('container');
    if (filter === 'tanker') return v.ship_type?.toLowerCase().includes('tanker');
    return true;
  });

  // Prepare chart data
  const vesselTypeData = [
    { name: 'Bulk Carriers', value: stats?.bulk_carriers || 0 },
    { name: 'Container Ships', value: stats?.container_ships || 0 },
    { name: 'Tankers', value: stats?.tankers || 0 },
    { name: 'Others', value: (stats?.total_in_port || 0) - 
      (stats?.bulk_carriers || 0) - 
      (stats?.container_ships || 0) - 
      (stats?.tankers || 0) }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="rounded-lg p-5"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <h2 style={{ color: 'var(--accent-red)' }}>Error Loading Data</h2>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-2">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 rounded text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--accent-blue)',
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>
              Hong Kong Port Intelligence
            </h2>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Real-time vessel movements from Hong Kong Marine Department
            </p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-1.5 rounded text-sm"
            style={{ 
              backgroundColor: 'var(--accent-blue)',
              color: 'white'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { 
              label: 'In Port', 
              value: stats.total_in_port, 
              color: 'var(--accent-blue)',
              note: 'Currently at anchorages'
            },
            { 
              label: 'Bulk Carriers', 
              value: stats.bulk_carriers, 
              color: 'var(--accent-orange)',
              note: 'Dry bulk vessels'
            },
            { 
              label: 'Expected', 
              value: stats.expected_arrivals, 
              color: 'var(--accent-green)',
              note: 'Arriving next 24h'
            },
            { 
              label: 'Departed', 
              value: stats.recent_departures, 
              color: 'var(--text-tertiary)',
              note: 'Last 24 hours'
            },
          ].map((stat, i) => (
            <div 
              key={i}
              className="rounded-lg p-4 card-hover"
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
                {stat.label}
              </p>
              <p 
                className="text-2xl font-bold mt-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {stat.note}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vessel Type Distribution */}
        <div 
          className="rounded-lg p-5 card-hover lg:col-span-1"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Vessel Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={vesselTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {vesselTypeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Filter & Vessel List */}
        <div 
          className="rounded-lg p-5 card-hover lg:col-span-2"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Vessel List ({filteredVessels.length})
            </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm rounded px-2 py-1"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Types</option>
              <option value="bulk">Bulk Carriers</option>
              <option value="container">Container Ships</option>
              <option value="tanker">Tankers</option>
            </select>
          </div>

          {/* Vessel Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left py-2 pr-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>Vessel</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>Type</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>Location</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>Arrival</th>
                </tr>
              </thead>
              <tbody>
                {filteredVessels.slice(0, 10).map((vessel, i) => (
                  <tr 
                    key={i}
                    style={{ borderBottom: '1px solid var(--border-primary)' }}
                    className="last:border-0"
                  >
                    <td className="py-2 pr-2" style={{ color: 'var(--text-primary)' }}>
                      <div className="font-medium">{vessel.vessel_name}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{vessel.call_sign || vessel.imo_no || '-'}</div>
                    </td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: vessel.ship_type?.toLowerCase().includes('bulk') 
                            ? 'rgba(245, 158, 11, 0.1)' 
                            : vessel.ship_type?.toLowerCase().includes('container')
                            ? 'rgba(14, 165, 233, 0.1)'
                            : 'var(--bg-tertiary)',
                          color: vessel.ship_type?.toLowerCase().includes('bulk')
                            ? 'var(--accent-orange)'
                            : vessel.ship_type?.toLowerCase().includes('container')
                            ? 'var(--accent-blue)'
                            : 'var(--text-tertiary)'
                        }}
                      >
                        {vessel.ship_type?.split('/')[0]?.substring(0, 15) || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                      {vessel.location?.substring(0, 25) || '-'}
                    </td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-muted)' }}>
                      {vessel.arrival_time 
                        ? new Date(vessel.arrival_time).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVessels.length > 10 && (
              <p 
                className="text-xs text-center mt-3 py-2"
                style={{ color: 'var(--text-muted)' }}
              >
                ... and {filteredVessels.length - 10} more vessels
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="rounded-lg p-4 text-xs"
        style={{ 
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-muted)'
        }}
      >
        <p>
          <strong>Data Source:</strong> Hong Kong Marine Department (mardep.gov.hk)
        </p>
        <p className="mt-1">
          Updated hourly • Historical data stored in Supabase for trend analysis
        </p>
      </div>
    </div>
  );
}
