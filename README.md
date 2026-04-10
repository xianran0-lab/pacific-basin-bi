# Pacific Basin Shipping BI Dashboard

A data-driven business intelligence dashboard for Pacific Basin Shipping (2343.HK), built as a portfolio project showcasing end-to-end capabilities across financial analysis, data engineering, and interactive visualization.

🔗 **Live Demo**: [pacific-basin-bi.vercel.app](https://pacific-basin-bi.vercel.app/)  
👤 **By**: [Rex Xian](https://www.linkedin.com/in/rex-xian-resume/)

---

## What It Does

Pacific Basin is one of the world's leading Handysize and Supramax dry bulk shipping operators. This dashboard surfaces key business insights across five tabs:

| Tab | What You See |
|-----|-------------|
| **Overview** | Revenue, EBITDA, net income trend 2021–2024 · 6 key insights |
| **Market** | PB TCE vs BHSI/BSI benchmarks · 4-year premium/discount analysis |
| **Cost** | Breakeven TCE vs actual TCE · safety margin trend |
| **Fleet** | Owned vs chartered fleet structure · cargo volume · dividends |
| **HK Marine** | Live vessel movements from Hong Kong Marine Department |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| API layer | Vercel Serverless Functions |
| Database | Supabase (PostgreSQL) — HK Marine voyage history |
| Deployment | Vercel |

---

## Data Sources

### Financial & Market Data (Static — from Annual Reports)
All financial KPIs, TCE figures, Baltic index averages, fleet structure, and cost analysis come from **Pacific Basin Annual Reports 2021–2024**. Data lives in `src/data/pbHistoricalData.ts`.

### Live Data (HK Marine Tab)
The HK Marine tab fetches real-time vessel movement data from **Hong Kong Marine Department** public XML feeds:

| XML Feed | Content |
|----------|---------|
| `RP04005i.XML` | Expected arrivals (ETA) |
| `RP05005i.XML` | Arrivals (ATA) |
| `RP06005i.XML` | In port |
| `RP05505i.XML` | Departures (ATD) |

Vessel records are upserted into Supabase using a voyage-based schema that tracks each vessel's full port call lifecycle (Expected → Arrived → Departed). Historical data accumulates over time for trend analysis.

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run lint
```

### Environment Variables (optional)

Only needed if you want HK Marine voyage data to persist in Supabase:

```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key   # required for writes
```

Without these, the HK Marine tab still works — it fetches live XML and returns it directly, just without database persistence.

---

## Project Structure

```
pacific-basin-bi/
├── api/
│   ├── baltic.ts          # Baltic index endpoint (currently unused by frontend)
│   ├── hk-marine.ts       # HK Marine XML fetch + Supabase upsert
│   └── ais.ts             # AIS vessel positions (demo data, not yet integrated)
├── src/
│   ├── components/        # 5 tab components + BalticIndexCard
│   ├── hooks/             # useHKMarineData, useBalticIndices
│   └── data/
│       └── pbHistoricalData.ts   # All static financial data
├── supabase-schema-v2.sql # Voyage-based database schema
└── vercel.json            # SPA routing + API function config
```

---

## Supabase Schema

The HK Marine feature uses a voyage-based schema designed to track vessel port calls across their full lifecycle:

```
Expected Arrivals XML ──→ ETA ──┐
Arrivals XML          ──→ ATA ──┼──→ voyages table (deduped by voyage_key)
In Port XML           ──→ ATA ──┤
Departures XML        ──→ ATD ──┘
```

Key tables: `vessels`, `voyages`, `raw_vessel_movements`  
Core function: `upsert_voyage()` — merges new data into existing voyage records.

See `supabase-schema-v2.sql` for the full schema.

---

## Roadmap

- [x] Core dashboard — financial KPIs across the shipping cycle
- [x] Baltic index cards — BHSI/BSI annual benchmarks with 4-year trend
- [x] HK Marine — live vessel tracking with Supabase voyage history
- [x] Vercel deployment with serverless API layer
- [ ] AIS real-time vessel position map
- [ ] Quarterly data toggle (seasonality analysis)
- [ ] Peer comparison — Star Bulk, Golden Ocean

---

*Portfolio project · Not investment advice*
