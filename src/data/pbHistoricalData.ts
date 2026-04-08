/**
 * Pacific Basin 历史数据 (2021-2024)
 * 
 * 数据来源: Pacific Basin 官方年报、Baltic Exchange、Clarksons Research
 * 最后更新: 2025年4月
 * 
 * 本文件包含 Pacific Basin 的财务和运营历史数据，用于 BI Dashboard 展示。
 */

// ==================== 类型定义 ====================

export interface AnnualData {
  year: number;
  handysizeTce: number;      // 美元/天
  supramaxTce: number;       // 美元/天
  bhsiIndex: number;         // Baltic Handysize Index
  bsiIndex: number;          // Baltic Supramax Index
  revenue: number;           // 百万美元
  ebitda: number;            // 百万美元
  netIncome: number;         // 百万美元
  coreFleet: number;         // 核心船队数量
}

export interface FleetStructure {
  year: number;
  owned: number;             // 自有船舶
  longTermCharter: number;   // 长期租入
  shortTermCharter: number;  // 短期/运营租入
  ownedRatio: number;        // 自有占比 (%)
  charterRatio: number;      // 租入占比 (%)
}

export interface TceOutperformance {
  year: number;
  handysizeOutperform: number;   // 超额收益 ($/天)
  handysizeOutperformPct: number; // 跑赢幅度 (%)
  supramaxOutperform: number;    // 超额收益 ($/天)
  supramaxOutperformPct: number;  // 跑赢幅度 (%)
}

export interface CostAnalysis {
  year: number;
  handysizeBreakeven: number;    // 盈亏平衡 TCE ($/天)
  supramaxBreakeven: number;     // 盈亏平衡 TCE ($/天)
  opexPerDay: number;            // 日均 OPEX ($/天)
  handysizeProfit: number;       // TCE 与盈亏平衡差额 ($/天)
  supramaxProfit: number;        // TCE 与盈亏平衡差额 ($/天)
}

export interface CargoAndDividend {
  year: number;
  cargoVolume: number;           // 货运量 (百万吨)
  dividend: number;              // 分红 (港仙/股)
  dividendPolicy: string;        // 分红政策说明
}

export interface SummaryMetrics {
  totalRevenue: number;          // 总收入 (百万美元)
  totalEbitda: number;           // 累计 EBITDA (百万美元)
  totalNetIncome: number;        // 累计净利润 (百万美元)
  totalCargoVolume: number;      // 累计货运量 (亿吨)
  avgCoreFleet: number;          // 平均核心船队
}

// ==================== 数据 ====================

/**
 * 年度核心数据 (2021-2024)
 */
export const annualData: AnnualData[] = [
  {
    year: 2021,
    handysizeTce: 20460,
    supramaxTce: 29350,
    bhsiIndex: 18670,
    bsiIndex: 25000,
    revenue: 2972.5,
    ebitda: 1026.7,
    netIncome: 844.8,
    coreFleet: 134,
  },
  {
    year: 2022,
    handysizeTce: 23430,
    supramaxTce: 28120,
    bhsiIndex: 18220,
    bsiIndex: 21040,
    revenue: 3281.6,
    ebitda: 935.0,
    netIncome: 702.0,
    coreFleet: 134,
  },
  {
    year: 2023,
    handysizeTce: 12250,
    supramaxTce: 13830,
    bhsiIndex: 10420,
    bsiIndex: 11240,
    revenue: 2296.6,
    ebitda: 347.2,
    netIncome: 109.4,
    coreFleet: 133,
  },
  {
    year: 2024,
    handysizeTce: 12840,
    supramaxTce: 13630,
    bhsiIndex: 12727,
    bsiIndex: 14270,
    revenue: 2581.6,
    ebitda: 333.4,
    netIncome: 131.7,
    coreFleet: 120,
  },
];

/**
 * 船队结构数据
 */
export const fleetStructure: FleetStructure[] = [
  { year: 2021, owned: 114, longTermCharter: 20, shortTermCharter: 133, ownedRatio: 85.1, charterRatio: 14.9 },
  { year: 2022, owned: 117, longTermCharter: 17, shortTermCharter: 133, ownedRatio: 87.3, charterRatio: 12.7 },
  { year: 2023, owned: 116, longTermCharter: 17, shortTermCharter: 133, ownedRatio: 87.2, charterRatio: 12.8 },
  { year: 2024, owned: 107, longTermCharter: 13, shortTermCharter: 133, ownedRatio: 89.2, charterRatio: 10.8 },
];

/**
 * TCE 超额收益分析
 */
export const tceOutperformance: TceOutperformance[] = [
  { year: 2021, handysizeOutperform: 1790, handysizeOutperformPct: 9.6, supramaxOutperform: 4350, supramaxOutperformPct: 17.4 },
  { year: 2022, handysizeOutperform: 5210, handysizeOutperformPct: 28.6, supramaxOutperform: 7080, supramaxOutperformPct: 33.7 },
  { year: 2023, handysizeOutperform: 1830, handysizeOutperformPct: 17.6, supramaxOutperform: 2590, supramaxOutperformPct: 23.0 },
  { year: 2024, handysizeOutperform: 113, handysizeOutperformPct: 0.9, supramaxOutperform: -640, supramaxOutperformPct: -4.5 },
];

/**
 * 成本与盈亏平衡分析
 */
export const costAnalysis: CostAnalysis[] = [
  { year: 2021, handysizeBreakeven: 8970, supramaxBreakeven: 9660, opexPerDay: 4170, handysizeProfit: 11490, supramaxProfit: 19690 },
  { year: 2022, handysizeBreakeven: 10260, supramaxBreakeven: 10950, opexPerDay: 4700, handysizeProfit: 13170, supramaxProfit: 17170 },
  { year: 2023, handysizeBreakeven: 9820, supramaxBreakeven: 10720, opexPerDay: 4750, handysizeProfit: 2430, supramaxProfit: 3110 },
  { year: 2024, handysizeBreakeven: 8820, supramaxBreakeven: 9720, opexPerDay: 4700, handysizeProfit: 4020, supramaxProfit: 3910 },
];

/**
 * 货量与分红数据
 */
export const cargoAndDividend: CargoAndDividend[] = [
  { year: 2021, cargoVolume: 75.0, dividend: 56.0, dividendPolicy: "基本42+特别18，占净利润66%" },
  { year: 2022, cargoVolume: 82.0, dividend: 78.0, dividendPolicy: "基本52+特别26，占净利润75%" },
  { year: 2023, cargoVolume: 84.7, dividend: 12.2, dividendPolicy: "基本8.1+特别4.1，占净利润75%" },
  { year: 2024, cargoVolume: 90.2, dividend: 9.2, dividendPolicy: "占净利润50% + 回购$4,000万" },
];

/**
 * 四年累计数据摘要
 */
export const summaryMetrics: SummaryMetrics = {
  totalRevenue: 11132.3,      // $11.13 billion
  totalEbitda: 2642.3,        // $2.64 billion
  totalNetIncome: 1787.9,     // $1.79 billion
  totalCargoVolume: 331.9,    // 3.32亿吨
  avgCoreFleet: 130.25,
};

/**
 * 关键业务洞察
 */
export const keyInsights = [
  "2021-2022年为超级周期，2023-2024回归常态但仍高于历史均值",
  "2021-2023年平均跑赢市场指数20%以上，展现卓越运营能力",
  "OPEX控制在$4,700/天，处于行业领先水平",
  "四年平均ROE约27%，2024年末净现金$1,970万，可用流动性$5.48亿",
  "持续出售老旧Handysize，购入现代化Supramax/Ultramax，自有比例提升至89%",
];

/**
 * 建议补充的数据维度
 */
export const recommendedDataDimensions = [
  { dimension: "分季度数据", details: "季度TCE、货量、收入确认", purpose: "分析季节性波动" },
  { dimension: "分航线数据", details: "大西洋/太平洋/印度洋贡献占比", purpose: "评估区域市场布局" },
  { dimension: "货物结构", details: "粮食/煤炭/铁矿石/小宗散货占比", purpose: "分析货种风险分散" },
  { dimension: "燃油与环保", details: "scrubber收益、CII评级、双燃料船投资", purpose: "ESG与成本分析" },
  { dimension: "竞争对手对比", details: "Star Bulk、Golden Ocean等同业TCE", purpose: "市场份额评估" },
  { dimension: "远期覆盖", details: "FFA定价与覆盖率", purpose: "风险管理分析" },
];

// ==================== 辅助函数 ====================

/**
 * 获取特定年份的数据
 */
export function getDataByYear(year: number): {
  annual?: AnnualData;
  fleet?: FleetStructure;
  tcePerf?: TceOutperformance;
  cost?: CostAnalysis;
  cargo?: CargoAndDividend;
} {
  return {
    annual: annualData.find(d => d.year === year),
    fleet: fleetStructure.find(d => d.year === year),
    tcePerf: tceOutperformance.find(d => d.year === year),
    cost: costAnalysis.find(d => d.year === year),
    cargo: cargoAndDividend.find(d => d.year === year),
  };
}

/**
 * 计算 CAGR (复合年增长率)
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * 获取收入 CAGR (2021-2024)
 */
export function getRevenueCAGR(): number {
  const start = annualData.find(d => d.year === 2021)?.revenue || 0;
  const end = annualData.find(d => d.year === 2024)?.revenue || 0;
  return calculateCAGR(start, end, 3);
}

/**
 * 格式化金额 (百万美元 → 亿美元)
 */
export function formatBillionUSD(value: number): string {
  return `$${(value / 100).toFixed(2)}亿`;
}

/**
 * 格式化金额 (千美元)
 */
export function formatKUSD(value: number): string {
  return `$${(value / 1000).toFixed(1)}K`;
}
