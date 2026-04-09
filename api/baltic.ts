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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://stooq.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`stooq.com returned ${response.status}`);
    }

    const csvText = await response.text();
    
    // Check if we got blocked
    if (csvText.includes('Write to www@stooq.com') || csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
      throw new Error('stooq.com blocked the request - anti-bot detection');
    }
    
    // Parse CSV
    const lines = csvText.trim().split('\n');
    
    // Check if we have valid CSV data
    if (lines.length < 2 || !lines[0].includes('Date')) {
      throw new Error('Invalid CSV format from stooq.com');
    }
    
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

    // Fallback: return static demo data for portfolio demonstration
    const demoData = generateDemoData(symbol as string);
    
    return res.json({
      symbol,
      ...demoData,
      cached: false,
      fallback: true,
      error: 'Live data unavailable, using demo data for demonstration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generate demo data when live API fails
 * Uses realistic values based on historical Baltic indices
 */
function generateDemoData(symbol: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Historical averages (approximate)
  const baseValues: Record<string, number> = {
    '^bdi': 1500,   // Baltic Dry Index
    '^bsi': 1100,   // Baltic Supramax
    '^bhsi': 800    // Baltic Handysize
  };
  
  const base = baseValues[symbol] || 1000;
  const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
  const close = Math.round(base * (1 + variation));
  
  // Generate 12 weeks of history
  const history = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const weekVariation = (Math.random() - 0.5) * 0.15;
    history.push({
      date: date.toISOString().split('T')[0],
      close: Math.round(base * (1 + weekVariation))
    });
  }
  
  return {
    date: today,
    open: Math.round(close * 0.99),
    high: Math.round(close * 1.02),
    low: Math.round(close * 0.98),
    close,
    volume: null,
    history,
    demo: true
  };
}
}
