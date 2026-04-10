import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Edge Function: Proxy Baltic Indices from Yahoo Finance
 *
 * Routes:
 * - /api/baltic?symbol=^bdi  (Baltic Dry Index)
 * - /api/baltic?symbol=^bsi  (Baltic Supramax Index)
 * - /api/baltic?symbol=^bhsi (Baltic Handysize Index)
 *
 * Why proxy? Yahoo Finance blocks CORS in browser. Server-side fetch works.
 * stooq.com was previous source but blocks Vercel server IPs.
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
    // Map stooq-style symbols to Yahoo Finance symbols
    const yahooSymbolMap: Record<string, string> = {
      '^bdi': 'BDI',
      '^bsi': 'BSI',
      '^bhsi': 'BHSI',
    };
    const yahooSymbol = yahooSymbolMap[symbol as string] ?? (symbol as string).replace('^', '');

    // Fetch 3 months of weekly data from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1wk&range=3mo`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      throw new Error('No data in Yahoo Finance response');
    }

    const meta = result.meta;
    const timestamps: number[] = result.timestamp ?? [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
    const opens: (number | null)[] = result.indicators?.quote?.[0]?.open ?? [];
    const highs: (number | null)[] = result.indicators?.quote?.[0]?.high ?? [];
    const lows: (number | null)[] = result.indicators?.quote?.[0]?.low ?? [];
    const volumes: (number | null)[] = result.indicators?.quote?.[0]?.volume ?? [];

    const history = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[i] ?? null,
      }))
      .filter(d => d.close !== null);

    if (history.length === 0) {
      throw new Error('Yahoo Finance returned empty history for ' + yahooSymbol);
    }

    const latest = history[history.length - 1];
    const latestIdx = timestamps.length - 1;

    const data = {
      date: latest.date,
      open: opens[latestIdx] ?? null,
      high: highs[latestIdx] ?? null,
      low: lows[latestIdx] ?? null,
      close: meta.regularMarketPrice ?? latest.close,
      volume: volumes[latestIdx] ?? null,
      history,
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
