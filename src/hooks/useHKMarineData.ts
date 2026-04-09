import { useState, useEffect } from 'react';

export interface VesselRecord {
  id?: number;
  vessel_name: string;
  imo_no?: string;
  call_sign?: string;
  ship_type: string;
  flag?: string;
  location?: string;
  arrival_time?: string;
  atd_time?: string;
  eta?: string;
  last_port?: string;
  last_berth?: string;
  agent_name?: string;
  status?: string;
  data_source: string;
  recorded_at: string;
}

export interface PortStats {
  total_in_port: number;
  bulk_carriers: number;
  container_ships: number;
  tankers: number;
  expected_arrivals: number;
  recent_departures: number;
}

interface UseHKMarineDataResult {
  vessels: VesselRecord[];
  stats: PortStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHKMarineData(
  action: string = 'current',
  type: string = 'all',
  hours: number = 24
): UseHKMarineDataResult {
  const [vessels, setVessels] = useState<VesselRecord[]>([]);
  const [stats, setStats] = useState<PortStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/hk-marine?action=${action}&type=${type}&hours=${hours}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setVessels(result.data || []);
        
        // Calculate stats from vessels data
        if (Array.isArray(result.data)) {
          const inPort = result.data.filter((v: VesselRecord) => 
            v.data_source === 'in_port'
          );
          const bulkCarriers = inPort.filter((v: VesselRecord) =>
            v.ship_type?.toLowerCase().includes('bulk')
          );
          const containerShips = inPort.filter((v: VesselRecord) =>
            v.ship_type?.toLowerCase().includes('container')
          );
          const tankers = inPort.filter((v: VesselRecord) =>
            v.ship_type?.toLowerCase().includes('tanker')
          );

          setStats({
            total_in_port: inPort.length,
            bulk_carriers: bulkCarriers.length,
            container_ships: containerShips.length,
            tankers: tankers.length,
            expected_arrivals: result.data.filter((v: VesselRecord) => 
              v.data_source === 'expected'
            ).length,
            recent_departures: result.data.filter((v: VesselRecord) => 
              v.data_source === 'departures'
            ).length
          });
        }
      } else {
        throw new Error(result.error || 'API returned unsuccessful');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [action, type, hours]);

  return {
    vessels,
    stats,
    loading,
    error,
    refetch: fetchData
  };
}
