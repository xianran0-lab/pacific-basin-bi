import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Edge Function: Proxy and parse Hong Kong Marine Department data
 * 
 * Endpoint: /api/hk-marine
 * 
 * Data sources:
 * - Vessel arrival/departure notices
 * - Port traffic statistics
 * 
 * Why proxy? HK Marine Dept may block browser requests; server-side parsing needed.
 */

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CachedData {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CachedData>();

// Target URLs (to be determined based on actual HK Marine Dept site structure)
const HK_MARINE_URLS = {
  portTraffic: 'https://www.mardep.gov.hk/en/pub_services/port_statistics.html',
  vesselMovements: 'https://www.mardep.gov.hk/en/pub_services/vmd.html'
};

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

  const { type = 'portTraffic' } = req.query;
  const cacheKey = type as string;
  const now = Date.now();

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return res.json({
      type,
      ...cached.data,
      cached: true,
      cachedAt: new Date(cached.timestamp).toISOString()
    });
  }

  try {
    const url = HK_MARINE_URLS[type as keyof typeof HK_MARINE_URLS];
    
    if (!url) {
      return res.status(400).json({
        error: 'Invalid type',
        validTypes: Object.keys(HK_MARINE_URLS),
        received: type
      });
    }

    // Fetch with polite headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PacificBasin-Dashboard/1.0; Educational Project)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      throw new Error(`HK Marine Dept returned ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML (basic extraction - to be refined based on actual page structure)
    // Note: This is a placeholder parser. Actual implementation depends on HK Marine Dept site structure
    const data = parseHKMarineHTML(html, type as string);

    // Cache result
    cache.set(cacheKey, { data, timestamp: now });

    return res.json({
      type,
      ...data,
      cached: false,
      fetchedAt: new Date().toISOString(),
      source: url
    });

  } catch (error) {
    console.error('HK Marine fetch error:', error);
    
    // Return stale cache if available
    if (cached) {
      return res.json({
        type,
        ...cached.data,
        cached: true,
        stale: true,
        cachedAt: new Date(cached.timestamp).toISOString(),
        error: 'Using stale data due to fetch error'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch HK Marine Department data',
      message: error instanceof Error ? error.message : 'Unknown error',
      type,
      note: 'HK Marine Dept site structure may have changed'
    });
  }
}

/**
 * Parse HK Marine Department HTML
 * 
 * NOTE: This is a placeholder implementation.
 * Actual parsing logic depends on the real HTML structure.
 * User has prior experience from COSCO with this data source.
 */
function parseHKMarineHTML(html: string, type: string): any {
  // Extract tables from HTML
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const tables = html.match(tableRegex) || [];
  
  if (type === 'portTraffic') {
    return {
      title: 'Hong Kong Port Traffic',
      tablesFound: tables.length,
      note: 'Full parser implementation pending - user has COSCO experience with this data source',
      sampleData: extractSampleData(html)
    };
  }
  
  if (type === 'vesselMovements') {
    return {
      title: 'Vessel Movements',
      tablesFound: tables.length,
      note: 'Full parser implementation pending',
      sampleData: extractSampleData(html)
    };
  }

  return { error: 'Unknown type' };
}

/**
 * Extract sample data from HTML for debugging
 */
function extractSampleData(html: string): any {
  // Extract text content for inspection
  const textContent = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
  
  return {
    preview: textContent + '...',
    length: html.length
  };
}
