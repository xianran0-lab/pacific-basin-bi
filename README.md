# Pacific Basin Shipping BI Dashboard

A data-driven business intelligence dashboard for Pacific Basin Shipping (2343.HK), built as a portfolio project to demonstrate end-to-end capabilities across data analysis, financial modeling, and interactive visualization.

## Live Demo

> Deploy link (coming soon)

## Overview

Pacific Basin is one of the world's leading Handysize and Supramax dry bulk shipping operators, headquartered in Hong Kong. This dashboard surfaces key operational and financial insights from their 2021–2024 annual reports across four analysis dimensions:

| Tab | Key Questions Answered |
|-----|------------------------|
| **Overview** | How did PB perform financially across the shipping cycle? |
| **Market Intelligence** | How much does PB outperform the Baltic market index? |
| **Cost & Profitability** | What is the safety margin above breakeven TCE? |
| **Fleet Strategy** | How is the fleet structured, and what are shareholder returns? |

## Stack

- **React 19** + **TypeScript** — Vite 8
- **Recharts** — all data visualizations
- **Tailwind CSS v4** — utility-first styling

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

## Data Sources

All data is sourced from publicly available materials:

- Pacific Basin Annual Reports 2021–2024
- Baltic Exchange (BHSI / BSI index values)
- Clarksons Research / investor presentations

Data is static and lives in `src/data/pbHistoricalData.ts`. No backend or API keys required.

## Roadmap

- [ ] Quarterly data for seasonality analysis
- [ ] BDI / BHSI historical CSV integration
- [ ] AIS real-time vessel position map (AISStream.io)
- [ ] Peer comparison (Star Bulk, Golden Ocean)
- [ ] Vercel deployment

---

*Portfolio project — not investment advice.*
