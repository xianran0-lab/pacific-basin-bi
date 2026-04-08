# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (HMR enabled)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Serve the production build locally
```

No test runner is configured yet.

## Stack

- **React 19** + **TypeScript 6** via **Vite 8**
- **Tailwind CSS v4** — integrated via `@tailwindcss/vite` plugin (no `tailwind.config.*` file). Styles are activated by `@import "tailwindcss"` at the top of `src/index.css`.
- **Recharts** — charting library available for data visualizations

## Architecture

This is a greenfield BI dashboard project. Currently only the Vite scaffold exists in `src/`. The intended direction is a Pacific Basin business intelligence UI built with Recharts charts and Tailwind utility classes.

Key wiring points:
- `vite.config.ts` — registers both `@vitejs/plugin-react` and `@tailwindcss/vite`
- `src/index.css` — global styles; `@import "tailwindcss"` must stay at the top
- `src/main.tsx` → `src/App.tsx` — entry point; replace/extend `App.tsx` for new pages or routes

TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`). All source lives under `src/`; `tsconfig.app.json` scopes compilation to that directory.

---

## Project Brief: Pacific Basin Shipping BI Dashboard

### 1. 项目概述

**目标**: 为 Pacific Basin Shipping（太平洋航运，港交所 2343.HK）构建一个数据驱动的 BI Dashboard 原型，整合公开数据，展示干散货航运业务的关键运营洞见。

**性质**: 个人作品集项目（Portfolio Project），面向航运行业潜在雇主或客户，展示从数据采集、分析到可视化的端到端能力。

### 2. 业务背景

#### 2.1 公司概况
Pacific Basin 是全球领先的 Handysize 和 Supramax 干散货船运营商，总部位于香港。公司运营约 277 艘船舶（112 艘自有 + 约 165 艘租赁），服务超过 600 家客户，覆盖 6 大洲 14 个办事处。

#### 2.2 商业模式

**收入端**: 通过现货市场（Spot）与期租（Period Charter）相结合的方式运营船队，追求高于市场指数的 TCE 溢价。2024 年 Handysize TCE 为 12,840 美元/天，Supramax 为 13,630 美元/天，分别跑赢 BHSI/BSI 指数 1,720 美元和 710 美元/天。

**成本端**: 采用"轻资产+规模驱动"策略，通过自有船舶与灵活租赁安排的组合，在市场周期中保持成本效率。含管理费用的盈亏平衡 TCE 约为 9,820 美元/天。

**货物组合**: 运输多元化的干散货商品，包括谷物、矿石、原木、铝土矿、糖、水泥、煤炭、化肥、钢材等。2024 年小宗散货增长主要由铝土矿、农产品、盐和林产品驱动。

#### 2.3 2024 财务摘要

| 指标 | 数值 |
|------|------|
| 收入 | 约 25.8 亿美元（+12% YoY） |
| EBITDA | 3.33 亿美元 |
| 净利润 | 1.32 亿美元 |
| ROE | 7% |
| EPS | 19.9 港仙 |
| 股东回报（股息+回购） | 约 1.01 亿美元（净利润的 83%） |

### 3. 核心概念解析

#### 3.1 TCE（Time Charter Equivalent，期租等值收入）
航运业最核心的收入衡量指标，表示**每艘船每天真正赚到的净收入**。

**公式**:
```
TCE = (航次总收入 - 航次成本) / 运营天数
其中航次成本 = 燃油 + 港口费 + 运河费
```

**为什么重要**: TCE 是统一度量衡——不管你是跑现货还是做期租，最终都折算成"每天净赚多少美元"，这样才能横向比较船与船、公司与公司、公司与市场指数之间的表现。

**PB 的 TCE Premium**: PB 2024 年 Handysize TCE = 12,840 美元/天，而市场指数 BHSI = 11,120 美元/天，说明 PB 每艘 Handysize 每天比市场平均多赚 1,720 美元。这就是他们引以为豪的 **TCE Premium**。

#### 3.2 现货 vs 期租

| 类型 | 英文 | 说明 | 特点 |
|------|------|------|------|
| 现货 | Spot / Voyage Charter | 按单次航程签约 | 价格随市场波动，行情好赚很多，行情差可能亏 |
| 期租 | Period / Time Charter | 按时间段签约（如6个月） | 收入锁定，不受短期市场波动影响 |

**PB 策略**: 两者结合——用期租锁定一个基本盘保底，用现货部分去捕捉市场上行的机会。这本质上是一个风险管理问题。

#### 3.3 轻资产策略
PB 自有约 112 艘船，但总共运营约 277 艘。差额的约 165 艘是**租进来的（Charter-in）**。

**好处**: 市场差的时候可以退租缩小船队，不用养一堆空船；不需要大量资本支出买船；灵活调整船队规模匹配需求。

**代价**: 租船有成本（charter-in cost），市场好的时候租金也会涨，压缩利润；自有船舶的长期成本其实更低。

### 4. 分析框架 —— 五个核心维度

Dashboard 围绕五个核心分析维度展开，每个维度回答一个关键业务问题：

| 维度 | 核心问题 | 关键指标 |
|------|---------|---------|
| **船队运营效率** | 我们的船跑得好不好？ | TCE、船队利用率（目标 >90%）、载货天数 vs 空驶天数比、航速与油耗、港口周转时间 |
| **财务表现** | 我们赚了多少？成本控制如何？ | 收入与利润趋势、每船每天 OPEX、盈亏平衡 TCE、ROE、股东回报率 |
| **市场情报** | 市场走势如何？我们相对表现怎样？ | BDI/BHSI/BSI 指数走势、PB 的 TCE 溢价（vs 市场指数）、现货 vs 期租比例、FFA 远期曲线 |
| **货物与贸易流** | 什么货在往哪里走？ | 货物品类组合及变化趋势、主要贸易航线运量、吨英里需求变化、太平洋 vs 大西洋区域平衡 |
| **船队战略** | 船队结构是否面向未来？ | 船龄分布、自有 vs 租赁比例与成本、新造船订单管线、洗涤器收益贡献、碳排放合规准备 |

### 5. 利润树框架

```
PB 净利润 = 收入 - 成本 - 税费
│
├── 收入（~25.8 亿美元）
│   │
│   ├── 运营天数 = 船舶数量 × 每船可用天数 × 利用率
│   │   ├── 船舶数量：277 艘（112 自有 + 165 租入）
│   │   ├── 每船可用天数：365 天 - 坞修/维修天数
│   │   └── 利用率：目标 >90%（空驶、等泊、调度效率）
│   │
│   ├── 日均收入 = TCE（每天每船净赚多少）
│   │   ├── 市场基准（BHSI / BSI 指数）
│   │   └── TCE 溢价（PB 比市场多赚的部分）
│   │       ├── 货物组合优化（选高利润航线/货种）
│   │       ├── 三角航线调度（减少空驶）
│   │       └── 客户关系（600+ 客户的网络效应）
│   │
│   └── 现货 vs 期租 比例（影响收入波动性）
│
├── 成本
│   │
│   ├── 航次成本（Voyage Costs）— 从 TCE 中已扣除
│   │   ├── 燃油（最大单项）
│   │   ├── 港口费
│   │   └── 运河通行费
│   │
│   ├── 船舶运营成本（OPEX）— 自有船
│   │   ├── 船员工资
│   │   ├── 维修保养
│   │   ├── 保险
│   │   └── 物料备件
│   │
│   ├── 租船成本（Charter-in Cost）— 租入船
│   │   └── ≈ 165 艘 × 每日租金 × 天数
│   │
│   ├── 折旧（Depreciation）— 自有船
│   │
│   ├── 管理费用（G&A）
│   │   └── 14 个办公室、员工、IT 等
│   │
│   └── 财务费用（利息等）
│
└── 盈亏平衡点
    └── TCE ≈ $9,820/天（含所有成本后刚好不亏）
```

### 6. 盈利提升路径

沿着利润树，PB 能提升盈利的杠杆点：

1. **提高 TCE（赚更多）**: 优化货物组合、三角航线减少空驶、利用客户网络效应
2. **提高利用率（多跑几天）**: 减少坞修、缩短港口等泊、提高调度效率
3. **压低成本（少花钱）**: 规模化采购、灵活调整租入船队、燃油效率优化
4. **调整船队结构（长期）**: 低船价时买入、高船价时卖出、新造船替换老旧船

### 7. 已收集历史数据

项目已收集 **Pacific Basin 2021-2024 年历史数据**，保存在 `src/data/` 目录：

| 文件 | 内容 | 用途 |
|------|------|------|
| `pbHistoricalData.ts` | 年度财务/运营数据、船队结构、TCE 超额收益、成本分析、货量分红 | React 组件直接导入，含类型定义和辅助函数 |
| `README.md` | 数据文档说明 | 人工查阅参考 |

**数据包含**: 4年 TCE/Baltic指数对比、船队自有vs租入结构、成本盈亏平衡分析、累计财务摘要（$111.3亿收入、$17.9亿净利润）

### 8. 数据源策略

#### 8.1 可用公开数据源

**Tier 1 — 核心数据（免费、高质量）**

| 数据源 | 内容 | 格式 | 更新频率 |
|--------|------|------|---------|
| PB 年报 / 中期报告 | TCE、P&L、船队、货物分析 | PDF → 手动提取 | 半年 |
| PB Earnings Call Transcript | 管理层评论、展望、细节数据 | 文本 | 半年 |
| Yahoo Finance (2343.HK) | 股价、财报摘要 | API | 实时 |
| Trading Economics | BDI 历史数据 | CSV / 网页 | 每日 |
| Statista | 全球航运统计 | CSV | 年度 |

**Tier 2 — 增强数据（免费、需对接）**

| 数据源 | 内容 | 接入方式 |
|--------|------|---------|
| AISStream.io | 实时 AIS 船位数据流 | WebSocket API（免费） |
| VesselFinder | 船舶位置与基础信息 | 网页 / 有限 API |
| AISHub | 聚合 AIS 数据 | API（需贡献数据交换） |

**Tier 3 — 高级数据（付费，了解即可）**
- Kpler（干散货贸易流与运费）
- AXSDry（船位+成交记录）
- Drewry Dry Bulk Forecaster（五年预测）
- Argus Dry Freight（运费评估）
- Oceanbolt（PB 自己使用的贸易流数据，有免费试用）

#### 7.2 数据采集优先级

```
Phase 1: PB 年报 PDF → 结构化数据（Python 提取）
Phase 2: BDI / BHSI / BSI 历史数据（公开来源）
Phase 3: AIS 实时船位（AISStream API）
Phase 4: 如有需要，接入付费数据源
```

### 8. 技术架构

```
数据采集层          分析层              存储层            展示层
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ PDF 解析  │     │ Pandas   │     │          │     │ React    │
│ API 拉取  │────▶│ 清洗/计算 │────▶│ Supabase │────▶│ Recharts │
│ Web 抓取  │     │ 洞见生成  │     │(Postgres)│     │ 地图     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
   Python            Python          云托管/免费       Vercel 部署
```

### 9. 项目里程碑

| 阶段 | 交付物 | 预计周期 |
|------|--------|---------|
| **Phase 0: 文档** | 项目背景文档（本文档） | ✅ 已完成 |
| **Phase 1: 数据** | PB 年报结构化数据 + BDI 历史数据入库 | 1 周 |
| **Phase 2: 分析** | Python 分析脚本（TCE 趋势、溢价计算、成本分析） | 1 周 |
| **Phase 3: API** | Supabase 数据表 + API 端点就绪 | 3 天 |
| **Phase 4: 前端** | React Dashboard 核心页面 | 1-2 周 |
| **Phase 5: 增强** | AIS 实时地图 + 交互式分析 | 1 周 |

### 10. 成功标准

本项目成功的标志不是"好看"，而是能回答以下问题：

1. Pacific Basin 的 TCE 溢价在过去 5 年如何变化？趋势是否可持续？
2. 哪些货物品类在增长？这对船队部署有什么启示？
3. 市场周期中，PB 的成本结构是否给了它足够的安全垫？
4. 船队的年龄和结构是否为未来的环保法规做好了准备？

如果 Dashboard 能用数据清晰回答这些问题，它就是一个有价值的作品。

---

*这份文档是项目的 Single Source of Truth。后续每写一行代码，都应该能追溯到文档里的某个分析维度或数据需求。*
