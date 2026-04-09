import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Edge Function: Proxy Baltic Indices from stooq.com
 * 
 * Routes:
 * - /api/baltic?symbol=^bdi  (Baltic Dry Index)
 * - /api/baltic?symbol=^bsi  (Baltic Supramax Index)
 * - /api/baltic?symbol=^bhsi (Baltic Handysize Index)
 * 
 * Why proxy? stooq.com blocks CORS in browser. Server-side fetch works.
 */

const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

interface CachedData {
  data: any;
  timestamp: number;
}

// In-memory cache (resets on function cold start, acceptable for demo)
const cache = new Map<string, CachedData>();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol = '^bdi' } = req.query;
  
  // Validate symbol
  const validSymbols = ['^bdi', '^bsi', '^bhsi'];
  if (!validSymbols.includes(symbol as string)) {
    return res.status(400).json({
      error: 'Invalid symbol',
      validSymbols,
      received: symbol
    });
  }

  const cacheKey = symbol as string;
  const now = Date.now();

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return res.json({
      symbol,
      ...cached.data,
      cached: true,
      cachedAt: new Date(cached.timestamp).toISOString()
    });
  }

  try {
    // Fetch from stooq.com
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol as string)}&i=w`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PacificBasin-Dashboard/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`stooq.com returned ${response.status}`);
    }

    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Get latest data point
    const latestLine = lines[lines.length - 1];
    const values = latestLine.split(',');
    
    const data = {
      date: values[0],
      open: parseFloat(values[1]) || null,
      high: parseFloat(values[2]) || null,
      low: parseFloat(values[3]) || null,
      close: parseFloat(values[4]) || null,
      volume: parseFloat(values[5]) || null,
      history: lines.slice(1).map(line => {
        const v = line.split(',');
        return {
          date: v[0],
          close: parseFloat(v[4]) || null
        };
      }).filter(d => d.close !== null)
    };

    // Cache result
    cache.set(cacheKey, { data, timestamp: now });

    return res.json({
      symbol,
      ...data,
      cached: false,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Baltic index fetch error:', error);
    
    // Return stale cache if available
    if (cached) {
      return res.json({
        symbol,
        ...cached.data,
        cached: true,
        stale: true,
        cachedAt: new Date(cached.timestamp).toISOString(),
        error: 'Using stale data due to fetch error'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch Baltic index',
      message: error instanceof Error ? error.message : 'Unknown error',
      symbol
    });
  }
}
