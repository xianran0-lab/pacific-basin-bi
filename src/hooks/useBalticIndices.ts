import { useState, useEffect } from 'react';

export interface BalticIndexData {
  symbol: string;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  history: Array<{ date: string; close: number }>;
  demo?: boolean;
  cached?: boolean;
  fallback?: boolean;
  fetchedAt?: string;
  cachedAt?: string;
  error?: string;
}

interface UseBalticIndicesResult {
  data: BalticIndexData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_KEY = 'baltic-indices-cache';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

interface CacheEntry {
  data: BalticIndexData;
  timestamp: number;
}

export function useBalticIndices(symbol: string = '^bdi'): UseBalticIndicesResult {
  const [data, setData] = useState<BalticIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check localStorage cache first
      const cachedRaw = localStorage.getItem(`${CACHE_KEY}-${symbol}`);
      if (cachedRaw) {
        const cached: CacheEntry = JSON.parse(cachedRaw);
        const now = Date.now();
        if (now - cached.timestamp < CACHE_TTL) {
          setData({
            ...cached.data,
            cached: true,
            cachedAt: new Date(cached.timestamp).toISOString()
          });
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch(`/api/baltic?symbol=${encodeURIComponent(symbol)}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result: BalticIndexData = await response.json();
      
      // Cache successful response
      if (!result.error) {
        localStorage.setItem(`${CACHE_KEY}-${symbol}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Keep existing data if available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Hook for multiple indices
export interface AllBalticIndices {
  bdi: BalticIndexData | null;
  bsi: BalticIndexData | null;
  bhsi: BalticIndexData | null;
  loading: boolean;
  error: string | null;
}

export function useAllBalticIndices(): AllBalticIndices {
  const bdi = useBalticIndices('^bdi');
  const bsi = useBalticIndices('^bsi');
  const bhsi = useBalticIndices('^bhsi');

  return {
    bdi: bdi.data,
    bsi: bsi.data,
    bhsi: bhsi.data,
    loading: bdi.loading || bsi.loading || bhsi.loading,
    error: bdi.error || bsi.error || bhsi.error || null
  };
}
