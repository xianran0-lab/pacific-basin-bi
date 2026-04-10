# TODOS — Pacific Basin BI Dashboard

Generated from CEO Plan review on 2026-04-08

---

## Phase 1: Foundation (Ship This Week)

### TODO-001: Deploy to Vercel ✅ DONE
**What:** Configure Vercel deployment with SPA routing, custom domain or vercel.app subdomain
**Why:** No live link = no portfolio piece; hiring manager needs a URL to click
**Pros:** 
- Immediate credibility; can share today
- Native support for Vite/React (no Dockerfile needed)
- Edge Functions for API layer (perfect for CORS proxy)
- No 256MB memory limit (unlike AI Builders Space)
**Cons:** None — this is pure upside
**Context:** 
- ✅ Vite build already configured (`npm run build` works)
- ✅ `vercel.json` created with SPA routing
- ✅ Edge Functions created (TODO-007)
**Effort:** S (15 min with CC+gstack)
**Priority:** P0
**Depends on:** TODO-007 (Edge Functions ready)
**Platform Decision:** Evaluated AI Builders Space (requires Docker + FastAPI refactor + 256MB limit). Vercel is better fit for this React + API architecture.
**Status:** Ready to deploy

---

### TODO-002: Baltic Index Integration ✅ DONE
**What:** Integrate stooq.com CSV API for real-time Baltic indices with caching and error handling
**Why:** Demonstrates real data integration skills; differentiator from static portfolios
**Pros:** Live data "breathes"; shows API integration capability; industry-relevant metrics
**Cons:** CORS risk (mitigated with proxy/fallback)
**Context:** Endpoints: `^bdi`, `^bsi`, `^bhsi` from stooq.com. Cache 4 hours. Fallback to static data if API fails.
**Effort:** M (~1-2 hrs)
**Priority:** P0
**Depends on:** TODO-001 (need live URL to test)

---

### TODO-003: Quarterly Data Toggle
**What:** Extract Q1-Q4 data from PB earnings reports; add Annual/Quarterly toggle to charts
**Why:** More granular analysis; shows attention to detail; reveals seasonality patterns
**Pros:** Deeper insights; demonstrates data extraction skills; low technical risk
**Cons:** PDF parsing may need manual fallback
**Context:** Use `pdf-parse` or Tabula for extraction. Budget 30 min manual if automated fails. Update Revenue/Profit/TCE charts.
**Effort:** M (~1.5 hrs)
**Priority:** P1
**Depends on:** None (uses existing data structure)

---

### TODO-007: Create Vercel Edge Functions (API Layer) — DONE ✅
**What:** Create 3 Edge Functions to proxy external APIs and handle CORS
**Why:** Pure SPA cannot fetch from stooq.com (CORS) or scrape HK Marine Dept; Edge Functions solve this
**Functions Created:**
1. `/api/baltic` — Proxy stooq.com Baltic indices (BDI/BSI/BHSI) with 4hr cache
2. `/api/hk-marine` — Proxy HK Marine Dept data with 24hr cache
3. `/api/ais` — Return vessel positions (demo data or AISStream API with key)
**Features:**
- In-memory caching with TTL
- Error handling with stale cache fallback
- CORS headers for browser access
- TypeScript types for safety
**Files Created:**
- `vercel.json` — SPA routing + API routes
- `api/baltic.ts` — Baltic index proxy
- `api/hk-marine.ts` — HK Marine Dept proxy
- `api/ais.ts` — Vessel positions
- `.env.example` — Environment variable template
**Effort:** S (30 min)
**Priority:** P0
**Depends on:** None
**Status:** ✅ Complete

---

## Phase 2: Domain Expertise (Week 2)

### TODO-004: Hong Kong Marine Department Integration ✅ DONE
**What:** Scrape vessel arrival/departure data from mardep.gov.hk; parse XML/HTML
**Why:** Leverages COSCO experience; unique Hong Kong angle; demonstrates government data integration
**Pros:** Differentiator; shows domain knowledge; real port intelligence
**Cons:** Government sites can change; need to respect rate limits
**Context:** XML/HTML parsing (known path from COSCO). Cache in localStorage (24hr). Target: port traffic, vessel inspection status.
**Effort:** M-L (~4-6 hrs)
**Priority:** P1
**Depends on:** None

---

### TODO-005: Vessel Age & ESG Analysis (Simplified)
**What:** Fleet composition analysis using PB annual report data; ESG readiness summary
**Why:** Answers success criteria #4; shows deep maritime domain knowledge
**Pros:** IMO compliance story; ESG is top-of-mind in shipping; charts look professional
**Cons:** Individual vessel age may require paid APIs (Clarksons/Equasis)
**Context:** Primary data source: PB annual reports. Fallback: skip individual ages, show fleet overview. Visual: composition chart, ESG radar/heatmap.
**Effort:** M (~2 hrs)
**Priority:** P2
**Depends on:** None

---

## Phase 3: The Wow Factor (Week 2-3)

### TODO-006: AIS Real-Time Map
**What:** Interactive map showing PB fleet positions via AISStream.io WebSocket API
**Why:** The "wow" moment; no other candidate will have this; demonstrates real-time data skills
**Pros:** Visually stunning; shows WebSocket/WebGL skills; maritime intelligence platform feel
**Cons:** API limits (10 WebSocket connections = 10 browser tabs); map performance with 277 markers
**Context:** Display PB-owned 112 vessels (or all 277 if API permits). Use Mapbox GL JS or Leaflet. Add vessel status, click for details.
**Effort:** L (~3-4 hrs)
**Priority:** P2
**Depends on:** None

---

## Phase 4: Future (Not Scheduled)

### TODO-101: Peer Comparison (Star Bulk, Golden Ocean)
**What:** Add competitor fleet and financial comparison
**Why:** Benchmarking is core to investment analysis
**Effort:** M (~3 hrs)
**Priority:** P3

### TODO-102: FFA (Forward Freight Agreement) Curves
**What:** Display forward freight curves for market forecasting
**Why:** Professional trading desks use this; demonstrates advanced domain knowledge
**Effort:** L (~1 day)
**Priority:** P3

### TODO-103: Weather Overlays on Map
**What:** Add weather layer to AIS map (wind, waves, storms)
**Why:** Operational intelligence; routing optimization
**Effort:** M (~2 hrs)
**Priority:** P3

### TODO-104: Mobile PWA
**What:** Convert to Progressive Web App with offline support
**Why:** Better mobile experience; can "install" on home screen
**Effort:** M (~2 hrs)
**Priority:** P3

### TODO-105: Real-Time Alerts
**What:** Push notifications for significant events (vessel arrival, index spike)
**Why:** Proactive intelligence; demonstrates event-driven architecture
**Effort:** L (~1 day)
**Priority:** P3

---

## Implementation Order (Confirmed)

```
Hour 0-1:    TODO-001 Deploy to Vercel
Hour 1-4:    TODO-002 Live BDI/BSI/BHSI
Hour 4-7:    TODO-003 Quarterly Toggle
Hour 7-13:   TODO-004 HK Marine Dept
Hour 13-19:  TODO-005 Vessel Age / ESG
Hour 19-24:  TODO-006 AIS Map (or defer to Phase 2)
```

**Total human effort:** ~24 hours
**With CC+gstack:** ~3-4 hours actual work

---

*Generated by /plan-ceo-review. Expand ambitiously, ship completely.*
