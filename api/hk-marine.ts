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
// Service role key required for writes (upsert_voyage RPC bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey;

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
    const shouldFetchFresh = action === 'current' || action === 'refresh';

    if (shouldFetchFresh) {
      // Fetch all XML sources in parallel — do NOT await storage
      const freshVessels = await fetchAllXML();

      if (freshVessels.length > 0) {
        // Store in background; don't block the response
        storeVoyages(freshVessels).catch(err =>
          console.error('Background storeVoyages error:', err)
        );

        return res.json({
          success: true,
          action,
          type,
          count: freshVessels.length,
          data: freshVessels,
          fetchedAt: new Date().toISOString(),
          source: 'live'
        });
      }
    }

    // Fallback: read from Supabase (history queries or when XML fetch returns empty)
    const data = await querySupabase(action as string, type as string, parseInt(hours as string));

    return res.json({
      success: true,
      action,
      type,
      count: Array.isArray(data) ? data.length : 0,
      data,
      fetchedAt: new Date().toISOString(),
      source: 'supabase'
    });

  } catch (error) {
    console.error('HK Marine error:', error);

    // Return demo data if nothing else works
    return res.json({
      success: true,
      demo: true,
      data: generateDemoData(),
      fetchedAt: new Date().toISOString()
    });
  }
}

/**
 * Fetch all 4 XML sources in parallel, return parsed VesselRecord[].
 * Does NOT write to Supabase — caller decides what to do with the data.
 */
async function fetchAllXML(): Promise<VesselRecord[]> {
  const recordedAt = new Date().toISOString();

  const results = await Promise.allSettled(
    Object.entries(XML_SOURCES).map(async ([sourceName, url]) => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PacificBasin-Dashboard/1.0)',
          'Accept': 'application/xml,text/xml,*/*'
        }
      });
      if (!response.ok) throw new Error(`${sourceName}: HTTP ${response.status}`);
      const xmlText = await response.text();
      return parseXML(xmlText, sourceName, recordedAt);
    })
  );

  const allRecords: VesselRecord[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allRecords.push(...result.value);
    } else {
      console.error('XML fetch failed:', result.reason);
    }
  }

  return allRecords;
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
 * Store vessel records via upsert_voyage RPC (v2 schema)
 * Each record calls the stored procedure which deduplicates by IMO+ETA/ATA/ATD
 */
async function storeVoyages(records: VesselRecord[]): Promise<void> {
  if (!supabaseUrl || !supabaseServiceKey) return;

  let stored = 0;
  let errors = 0;

  for (const record of records) {
    // Map data_source → correct time slot
    let p_eta: string | null = null;
    let p_ata: string | null = null;
    let p_atd: string | null = null;

    switch (record.data_source) {
      case 'expected':
        p_eta = record.eta || null;
        break;
      case 'arrivals':
      case 'in_port':
        p_ata = record.arrival_time || null;
        break;
      case 'departures':
        p_ata = record.arrival_time || null;
        p_atd = record.atd_time || null;
        break;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_voyage`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_imo_no:     record.imo_no     || null,
          p_call_sign:  record.call_sign  || null,
          p_vessel_name: record.vessel_name,
          p_ship_type:  record.ship_type,
          p_flag:       record.flag       || null,
          p_eta,
          p_ata,
          p_atd,
          p_location:   record.location   || null,
          p_last_port:  record.last_port  || null,
          p_last_berth: record.last_berth || null,
          p_agent_name: record.agent_name || null,
          p_status:     record.status     || null,
          p_source_xml: record.data_source,
          p_raw_data:   record,
        }),
      });

      if (!response.ok) {
        console.error(`upsert_voyage failed for ${record.vessel_name}:`, await response.text());
        errors++;
      } else {
        stored++;
      }
    } catch (err) {
      console.error(`upsert_voyage error for ${record.vessel_name}:`, err);
      errors++;
    }
  }

  console.log(`storeVoyages: ${stored} stored, ${errors} errors`);
}

/**
 * Query data from Supabase (v2 schema: voyages table)
 * Maps voyage rows back to VesselRecord format expected by the frontend
 */
async function querySupabase(
  _action: string,
  type: string,
  hours: number
): Promise<any[]> {
  if (!supabaseUrl || !supabaseKey) {
    return generateDemoData();
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  // Query voyages updated within the time window
  let query = `${supabaseUrl}/rest/v1/voyages?last_updated_at=gte.${encodeURIComponent(since)}`;

  // Filter by vessel type
  if (type !== 'all') {
    const keyword = type === 'bulk' ? 'BULK' : type === 'container' ? 'CONTAINER' : 'TANKER';
    query += `&ship_type=ilike.*${keyword}*`;
  }

  query += '&order=last_updated_at.desc&limit=500';

  const response = await fetch(query, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status}`);
  }

  const voyages: any[] = await response.json();

  // Map to VesselRecord shape for frontend compatibility
  return voyages.map(v => ({
    vessel_name: v.vessel_name,
    imo_no:      v.imo_no,
    call_sign:   v.call_sign,
    ship_type:   v.ship_type || 'Unknown',
    flag:        v.flag,
    location:    v.location,
    arrival_time: v.ata,
    atd_time:    v.atd,
    eta:         v.eta,
    last_port:   v.last_port,
    last_berth:  v.last_berth,
    agent_name:  v.agent_name,
    status:      v.status,
    // Derive data_source from which timestamps are populated
    data_source: v.atd ? 'departures' : v.ata ? 'in_port' : 'expected',
    recorded_at: v.last_updated_at || v.first_seen_at,
  }));
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
