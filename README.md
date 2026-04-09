# Pacific Basin Shipping BI Dashboard

A data-driven business intelligence dashboard for Pacific Basin Shipping (2343.HK), built as a portfolio project to demonstrate end-to-end capabilities across data analysis, financial modeling, and interactive visualization.

🔗 **Live Demo**: [pacific-basin-bi.vercel.app](https://pacific-basin-bi.vercel.app/)

---

## Overview

Pacific Basin is one of the world's leading Handysize and Supramax dry bulk shipping operators, headquartered in Hong Kong. This dashboard surfaces key operational and financial insights across five analysis dimensions:

| Tab | Key Questions Answered |
|-----|------------------------|
| **Overview** | Financial performance across the shipping cycle (2021–2024) |
| **Market Intelligence** | PB's TCE vs Baltic market index + real-time Baltic rates |
| **Cost & Profitability** | Safety margin above breakeven TCE |
| **Fleet Strategy** | Fleet structure and shareholder returns |
| **HK Marine** | Real-time Hong Kong port vessel movements |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Backend** | Vercel Edge Functions |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel |

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

---

## Data Sources

### Financial Data (Static)
- Pacific Basin Annual Reports 2021–2024
- Clarksons Research / investor presentations
- Data lives in `src/data/pbHistoricalData.ts`

### Real-Time Data (Edge Functions)

| Endpoint | Source | Update Frequency |
|----------|--------|------------------|
| `/api/baltic` | stooq.com | Real-time on request (cached 5 min) |
| `/api/hk-marine` | HK Marine Department XML | Hourly batch sync to Supabase |
| `/api/ais` | AISStream.io (planned) | Real-time WebSocket |

### HK Marine Data Architecture

Hong Kong Marine Department provides 4 XML feeds that represent a vessel's journey:

```
Expected Arrivals (RP04005i) ──→ ETA ──┐
                                       │
Actual Arrivals (RP05005i) ────→ ATA ──┼──→ Voyage Record (航次)
                                       │      (in/out timestamps)
Departures (RP05505i) ─────────→ ATD ──┘
```

Database design tracks **vessel voyages** (航次) as continuous flows, enabling:
- Port stay duration calculation
- Visit frequency analytics
- Historical vessel movement patterns

---

## Project Structure

```
pacific-basin-bi/
├── api/                    # Vercel Edge Functions
│   ├── baltic.ts          # Baltic index scraper
│   ├── hk-marine.ts       # HK Marine XML → Supabase
│   └── ais.ts             # AISStream integration (WIP)
├── src/
│   ├── components/        # React components (5 tabs)
│   ├── hooks/             # Custom hooks (useHKMarineData)
│   └── data/              # Static financial data
├── supabase-schema-v2.sql # Database schema
└── README.md
```

---

## Roadmap

- [x] **Core dashboard** with financial KPIs
- [x] **Baltic indices** real-time integration
- [x] **HK Marine** port vessel tracking (v2 with voyage-based model)
- [x] **Vercel deployment**
- [ ] **AIS real-time** vessel position map
- [ ] **Peer comparison** (Star Bulk, Golden Ocean)
- [ ] **Quarterly data** for seasonality analysis
- [ ] **BDI/BHSI historical** CSV integration

---

*Portfolio project — not investment advice.*
