import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Edge Function: Fetch and store HK Marine Department data
 * 
 * Data Sources:
 * - RP05005i.XML: Arrivals (到港)
 * - RP04005i.XML: Expected arrivals (预计到港)
 * - RP06005i.XML: In port (在港)
 * - RP05505i.XML: Departures (离港)
 * 
 * Stores data in Supabase for historical analysis
 */

const XML_SOURCES = {
  arrivals: 'https://www.mardep.gov.hk/e_files/en/pub_services/RP05005i.XML',
  expected: 'https://www.mardep.gov.hk/e_files/en/pub_services/RP04005i.XML',
  in_port: 'https://www.mardep.gov.hk/e_files/en/pub_services/RP06005i.XML',
  departures: 'https://www.mardep.gov.hk/e_files/en/pub_services/RP05505i.XML'
};

interface VesselRecord {
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

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

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
    action = 'current',  // 'current' | 'history' | 'stats'
    type = 'all',        // 'all' | 'bulk' | 'container' | 'tanker'
    hours = '24'         // 查询最近多少小时的数据
  } = req.query;

  try {
    // Check if we need to fetch fresh data
    const shouldFetchFresh = action === 'current' || action === 'refresh';
    
    if (shouldFetchFresh) {
      await fetchAndStoreAllData();
    }

    // Query data from Supabase
    const data = await querySupabase(action as string, type as string, parseInt(hours as string));

    return res.json({
      success: true,
      action,
      type,
      count: Array.isArray(data) ? data.length : 0,
      data,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('HK Marine error:', error);
    
    // Return demo data if Supabase not configured
    if (!supabaseUrl || !supabaseKey) {
      return res.json({
        success: true,
        demo: true,
        message: 'Supabase not configured, returning demo data',
        data: generateDemoData(),
        setup_required: {
          supabase_url: 'Add SUPABASE_URL to environment variables',
          supabase_key: 'Add SUPABASE_ANON_KEY to environment variables'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Fetch all XML sources and store in Supabase
 */
async function fetchAndStoreAllData(): Promise<void> {
  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase not configured, skipping data storage');
    return;
  }

  const allRecords: VesselRecord[] = [];
  const recordedAt = new Date().toISOString();

  for (const [sourceName, url] of Object.entries(XML_SOURCES)) {
    try {
      console.log(`Fetching ${sourceName} from ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PacificBasin-Dashboard/1.0)',
          'Accept': 'application/xml,text/xml,*/*'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${sourceName}: ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const records = parseXML(xmlText, sourceName, recordedAt);
      allRecords.push(...records);
      
      console.log(`Parsed ${records.length} records from ${sourceName}`);

    } catch (error) {
      console.error(`Error fetching ${sourceName}:`, error);
    }
  }

  // Store in Supabase
  if (allRecords.length > 0) {
    await storeInSupabase(allRecords);
  }
}

/**
 * Parse XML to vessel records
 */
function parseXML(xmlText: string, dataSource: string, recordedAt: string): VesselRecord[] {
  const records: VesselRecord[] = [];
  
  // Extract G_SQL1 elements (common pattern in all 4 XMLs)
  const vesselRegex = /<G_SQL1>([\s\S]*?)<\/G_SQL1>/g;
  let match;
  
  while ((match = vesselRegex.exec(xmlText)) !== null) {
    const vesselXml = match[1];
    
    const record: VesselRecord = {
      vessel_name: extractTag(vesselXml, 'VESSEL_NAME') || 'Unknown',
      imo_no: extractTag(vesselXml, 'IMO_NO') || undefined,
      call_sign: extractTag(vesselXml, 'CALL_SIGN') || undefined,
      ship_type: extractTag(vesselXml, 'SHIP_TYPE') || 'Unknown',
      flag: extractTag(vesselXml, 'FLAG') || undefined,
      location: extractTag(vesselXml, 'CURRENT_LOCATION') || undefined,
      agent_name: extractTag(vesselXml, 'AGENT_NAME') || undefined,
      status: extractTag(vesselXml, 'STATUS') || extractTag(vesselXml, 'REMARK') || undefined,
      data_source: dataSource,
      recorded_at: recordedAt
    };

    // Parse timestamps
    const arrivalTime = extractTag(vesselXml, 'ARRIVAL_TIME');
    if (arrivalTime) {
      record.arrival_time = parseTimestamp(arrivalTime);
    }

    const atdTime = extractTag(vesselXml, 'ATD_TIME');
    if (atdTime) {
      record.atd_time = parseTimestamp(atdTime);
    }

    const eta = extractTag(vesselXml, 'ETA');
    if (eta) {
      record.eta = parseTimestamp(eta);
    }

    const lastPort = extractTag(vesselXml, 'LAST_PORT');
    if (lastPort) {
      record.last_port = lastPort;
    }

    const lastBerth = extractTag(vesselXml, 'LAST_BERTH');
    if (lastBerth) {
      record.last_berth = lastBerth;
    }

    records.push(record);
  }

  return records;
}

/**
 * Extract value from XML tag
 */
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Parse various timestamp formats
 */
function parseTimestamp(ts: string): string | undefined {
  // Try common formats
  const formats = [
    // 09-APR-2026 07:44
    { regex: /(\d{2})-([A-Z]{3})-(\d{4}) (\d{2}):(\d{2})/, fn: (m: RegExpMatchArray) => {
      const months: Record<string, string> = {
        JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
        JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
      };
      return `${m[3]}-${months[m[2]]}-${m[1]}T${m[4]}:${m[5]}:00`;
    }},
    // 2026/04/09 07:30
    { regex: /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/, fn: (m: RegExpMatchArray) => {
      return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
    }},
    // 2026/04/11 12:00
    { regex: /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/, fn: (m: RegExpMatchArray) => {
      return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
    }}
  ];

  for (const format of formats) {
    const match = ts.match(format.regex);
    if (match) {
      return format.fn(match);
    }
  }

  return undefined;
}

/**
 * Store records in Supabase
 */
async function storeInSupabase(records: VesselRecord[]): Promise<void> {
  // Batch insert (Supabase has limit, so we chunk)
  const chunkSize = 100;
  
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/hk_vessel_positions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'  // Upsert on conflict
      },
      body: JSON.stringify(chunk)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase insert error:', error);
    } else {
      console.log(`Stored chunk ${i / chunkSize + 1}: ${chunk.length} records`);
    }
  }
}

/**
 * Query data from Supabase
 */
async function querySupabase(
  action: string, 
  type: string, 
  hours: number
): Promise<any[]> {
  if (!supabaseUrl || !supabaseKey) {
    return generateDemoData();
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  let query = `${supabaseUrl}/rest/v1/hk_vessel_positions?recorded_at=gte.${encodeURIComponent(since)}`;
  
  // Filter by vessel type
  if (type !== 'all') {
    const typeFilter = type === 'bulk' ? 'ilike.*BULK*' :
                      type === 'container' ? 'ilike.*CONTAINER*' :
                      type === 'tanker' ? 'ilike.*TANKER*' : '';
    if (typeFilter) {
      query += `&ship_type=${typeFilter}`;
    }
  }
  
  // Order by recorded time
  query += '&order=recorded_at.desc';
  
  // Limit results
  query += '&limit=500';

  const response = await fetch(query, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Generate demo data when Supabase not configured
 */
function generateDemoData(): any[] {
  const demoVessels = [
    {
      vessel_name: 'PACIFIC EXPLORER',
      imo_no: '9456789',
      call_sign: 'VRPE',
      ship_type: 'BULK/ ORE CARRIER',
      flag: 'HONG KONG',
      location: 'SOUTH EAST LAMMA ANCHORAGE',
      arrival_time: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      agent_name: 'PACIFIC BASIN SHIPPING',
      data_source: 'in_port',
      recorded_at: new Date().toISOString()
    },
    {
      vessel_name: 'ASIAN MERCHANT',
      imo_no: '9234567',
      call_sign: 'VRAH',
      ship_type: 'BULK/ WOODCHIP CARRIER',
      flag: 'PANAMA',
      location: 'SOUTH WEST LAMMA ANCHORAGE',
      arrival_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      agent_name: 'BEN LINE AGENCIES',
      data_source: 'in_port',
      recorded_at: new Date().toISOString()
    },
    {
      vessel_name: 'GLOBAL TRADER',
      imo_no: '9567890',
      call_sign: '9VGT',
      ship_type: 'BULK CARRIER',
      flag: 'SINGAPORE',
      location: 'NORTH LAMMA ANCHORAGE',
      eta: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      last_port: 'SINGAPORE',
      agent_name: 'WILHELMSEN PORT SERVICES',
      data_source: 'expected',
      recorded_at: new Date().toISOString()
    }
  ];

  return demoVessels;
}
