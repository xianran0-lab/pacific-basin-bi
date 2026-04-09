import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Edge Function: Proxy AIS vessel positions
 * 
 * Endpoint: /api/ais
 * 
 * Returns cached vessel positions from AISStream or similar AIS provider.
 * This is a server-to-server proxy to hide API keys and handle CORS.
 * 
 * Note: Real-time WebSocket streaming is not supported in Edge Functions.
 * This endpoint returns cached positions with periodic refresh.
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

interface CachedData {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CachedData>();

// Sample PB-owned vessels (IMO numbers to be verified)
// Source: PB annual reports - actual IMO list needed
const SAMPLE_VESSELS = [
  { imo: '1234567', name: 'PB Example 1', type: 'Handysize' },
  { imo: '1234568', name: 'PB Example 2', type: 'Handysize' },
  { imo: '1234569', name: 'PB Example 3', type: 'Supramax' },
];

interface VesselPosition {
  imo: string;
  name: string;
  type: 'Handysize' | 'Supramax';
  lat: number;
  lng: number;
  status: 'at-sea' | 'in-port' | 'loading' | 'unknown';
  lastUpdate: string;
  speed?: number;
  course?: number;
  destination?: string;
}

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

  const { 
    limit = '30', // Default to 30 vessels (performance constraint)
    type = 'all' // 'all' | 'Handysize' | 'Supramax'
  } = req.query;

  const cacheKey = `ais-${type}-${limit}`;
  const now = Date.now();

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return res.json({
      ...cached.data,
      cached: true,
      cachedAt: new Date(cached.timestamp).toISOString()
    });
  }

  try {
    // Try to fetch from AISStream API if API key is configured
    const apiKey = process.env.AISSTREAM_API_KEY;
    
    let vessels: VesselPosition[] = [];
    
    if (apiKey) {
      // Fetch from real AIS API
      vessels = await fetchAISFromAPI(apiKey, parseInt(limit as string), type as string);
    } else {
      // Generate realistic demo data (for portfolio demonstration)
      vessels = generateDemoVessels(parseInt(limit as string), type as string);
    }

    const data = {
      vessels,
      count: vessels.length,
      limit: parseInt(limit as string),
      type,
      source: apiKey ? 'AISStream API' : 'Demo data (add AISSTREAM_API_KEY for real data)',
      fetchedAt: new Date().toISOString()
    };

    // Cache result
    cache.set(cacheKey, { data, timestamp: now });

    return res.json({
      ...data,
      cached: false
    });

  } catch (error) {
    console.error('AIS fetch error:', error);
    
    // Return stale cache if available
    if (cached) {
      return res.json({
        ...cached.data,
        cached: true,
        stale: true,
        cachedAt: new Date(cached.timestamp).toISOString(),
        error: 'Using stale data due to fetch error'
      });
    }

    // Fallback to demo data on error
    const vessels = generateDemoVessels(parseInt(limit as string), type as string);
    
    return res.json({
      vessels,
      count: vessels.length,
      limit: parseInt(limit as string),
      type,
      source: 'Demo data (fallback due to error)',
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Fetch vessel positions from AISStream API
 */
async function fetchAISFromAPI(apiKey: string, limit: number, type: string): Promise<VesselPosition[]> {
  // AISStream API endpoint (to be implemented with actual API key)
  // https://aisstream.io/documentation/api
  
  // Placeholder: In real implementation, this would:
  // 1. Query AISStream with bounding box (HK region)
  // 2. Filter for PB-owned vessels
  // 3. Return structured position data
  
  // For now, return demo data with a note
  return generateDemoVessels(limit, type).map(v => ({
    ...v,
    source: 'AISStream (demo mode - implement real API call)'
  }));
}

/**
 * Generate realistic demo vessel positions for portfolio demonstration
 * 
 * This ensures the demo works even without AISStream API key.
 * Positions are centered around Hong Kong and major shipping lanes.
 */
function generateDemoVessels(limit: number, typeFilter: string): VesselPosition[] {
  const vessels: VesselPosition[] = [];
  
  // Major dry bulk ports and shipping lanes
  const locations = [
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'in-port' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, type: 'in-port' },
    { name: 'Qingdao', lat: 36.0671, lng: 120.3826, type: 'in-port' },
    { name: 'Port Hedland', lat: -20.3139, lng: 118.6113, type: 'loading' },
    { name: 'South China Sea', lat: 12.0, lng: 115.0, type: 'at-sea' },
    { name: 'Malacca Strait', lat: 3.5, lng: 100.0, type: 'at-sea' },
    { name: 'North Pacific', lat: 35.0, lng: 150.0, type: 'at-sea' },
    { name: 'Indian Ocean', lat: -10.0, lng: 80.0, type: 'at-sea' },
  ];

  const vesselTypes: Array<'Handysize' | 'Supramax'> = ['Handysize', 'Supramax'];
  
  for (let i = 0; i < limit; i++) {
    const location = locations[i % locations.length];
    const vesselType = vesselTypes[i % vesselTypes.length];
    
    // Filter by type if specified
    if (typeFilter !== 'all' && vesselType !== typeFilter) {
      continue;
    }

    // Add random offset for visual spread
    const latOffset = (Math.random() - 0.5) * 2;
    const lngOffset = (Math.random() - 0.5) * 4;
    
    const status: VesselPosition['status'] = location.type === 'loading' 
      ? 'loading' 
      : (Math.random() > 0.3 ? 'at-sea' : 'in-port');

    vessels.push({
      imo: `IMO${1000000 + i}`,
      name: `PB Vessel ${i + 1}`,
      type: vesselType,
      lat: location.lat + latOffset,
      lng: location.lng + lngOffset,
      status,
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      speed: status === 'at-sea' ? Math.round(Math.random() * 12 + 4) : 0,
      course: Math.round(Math.random() * 360),
      destination: locations[(i + 1) % locations.length].name
    });
  }

  return vessels;
}
