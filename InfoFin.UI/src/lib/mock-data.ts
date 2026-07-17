export const kpis = {
  totalBudget: 4_850_000,
  totalSpent: 3_120_000,
  remaining: 1_730_000,
  ebit: 920_000,
}

export const executionForecast = [
  { month: 'Jan', revenue: 410, opex: 280 },
  { month: 'Feb', revenue: 430, opex: 300 },
  { month: 'Mar', revenue: 470, opex: 310 },
  { month: 'Apr', revenue: 460, opex: 330 },
  { month: 'May', revenue: 520, opex: 350 },
  { month: 'Jun', revenue: 540, opex: 360 },
]

export const costBreakdown = [
  { name: 'Fixed', value: 1_420_000, key: 'chart-1' },
  { name: 'Variable', value: 1_080_000, key: 'chart-2' },
  { name: 'Cost of Sales', value: 620_000, key: 'chart-4' },
]

export const overspentCategories = [
  { Account: 'Events', department: 'CIRRUS - DIGITAL', budget: 220000, spent: 268000 },
  { Account: 'Travel', department: 'INFOSET SARL - MONETIQUE', budget: 140000, spent: 161500 },
  { Account: 'Facilities', department: 'GENISYS - CLOUD', budget: 310000, spent: 332000 },
  { Account: 'Software Licenses', department: 'AGMUX', budget: 180000, spent: 192400 },
]

export const budgetRows = [
  { Account: 'Advertising', forecast: 480000, actual: 312000 },
  { Account: 'Events', forecast: 220000, actual: 268000 },
  { Account: 'Travel', forecast: 140000, actual: 121000 },
  { Account: 'Software Licenses', forecast: 180000, actual: 192400 },
  { Account: 'Hardware', forecast: 260000, actual: 188000 },
  { Account: 'Facilities', forecast: 310000, actual: 332000 },
  { Account: 'Logistics', forecast: 240000, actual: 176000 },
  { Account: 'Professional Services', forecast: 200000, actual: 154000 },
]

export const departments = [
  'CIRRUS - DIGITAL',
  'INFOSET SARL - MONETIQUE',
  'GENISYS - CLOUD',
  'AGMUX',
  'DG',
  'FPA',
  'ADMIN & ACCOUNTING',
]

export const categories = [
  'Advertising',
  'Events',
  'Travel',
  'Software Licenses',
  'Hardware',
  'Facilities',
  'Logistics',
  'Professional Services',
]

export const vendors = [
  'Meridian Media',
  'CloudStack Inc.',
  'Northgate Services',
  'Globe Travel Co.',
  'Summit Events',
  'TechSupply Ltd.',
  'FastFreight',
]

export const categoryTree = [
  {
    group: 'Operating Expenses',
    classifications: [
      { name: 'Marketing', items: ['Advertising', 'Events', 'Sponsorships'] },
      { name: 'Travel & Entertainment', items: ['Travel', 'Meals', 'Lodging'] },
    ],
  },
  {
    group: 'Capital Expenditure',
    classifications: [
      { name: 'IT', items: ['Hardware', 'Software Licenses'] },
      { name: 'Facilities', items: ['Refurbishment', 'Equipment'] },
    ],
  },
  {
    group: 'Cost of Sales',
    classifications: [
      { name: 'Logistics', items: ['Freight', 'Warehousing'] },
      { name: 'Production', items: ['Raw Materials', 'Contractors'] },
    ],
  },
]

export const masterDepartments = [
  { name: 'CIRRUS - DIGITAL', unit: 'BU', group: 'Banking & Digital' },
  { name: 'INFOSET SARL - MONETIQUE', unit: 'BU', group: 'Banking & Digital' },
  { name: 'GENISYS - CLOUD', unit: 'BU', group: 'IT & Cloud' },
  { name: 'AGMUX', unit: 'BU', group: 'IT & Cloud' },
  { name: 'DG', unit: 'SU', group: 'DG, Admin & Fin' },
  { name: 'FPA', unit: 'SU', group: 'DG, Admin & Fin' },
  { name: 'ADMIN & ACCOUNTING', unit: 'SU', group: 'DG, Admin & Fin' },
]

export const masterUsers = [
  { email: 'dana.whitfield@infoset.cd', role: 'Financial Analyst', department: 'CIRRUS - DIGITAL', active: true },
  { email: 'marcus.lee@infoset.cd', role: 'Director', department: 'INFOSET SARL - MONETIQUE', active: true },
  { email: 'liam.chen@infoset.cd', role: 'FPA Reviewer', department: 'FPA', active: true },
  { email: 'eleanor.voss@infoset.cd', role: 'Managing Director', department: 'DG', active: true },
  { email: 'priya.nair@infoset.cd', role: 'Financial Analyst', department: 'GENISYS - CLOUD', active: true },
  { email: 'tomas.berg@infoset.cd', role: 'Financial Analyst', department: 'AGMUX', active: false },
]

export const masterVendors = [
  { name: 'Meridian Media', Account: 'Advertising', country: 'United States' },
  { name: 'CloudStack Inc.', Account: 'Software Licenses', country: 'United States' },
  { name: 'Northgate Services', Account: 'Facilities', country: 'United Kingdom' },
  { name: 'Globe Travel Co.', Account: 'Travel', country: 'Germany' },
  { name: 'Summit Events', Account: 'Events', country: 'United States' },
]

export const currencies = [
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', rate: 0.79 },
  { code: 'FC', name: 'Functional Currency', rate: 14.4 },
]

// ---- Financial reporting dataset (mirrors the legacy Power BI report) ----

export type BudgetLine = {
  label: string
  yForecast: number
  todate: number
  execution: number
  pct: number
  emphasis?: boolean
}

export const yearlyBudgetPerformance: BudgetLine[] = [
  { label: 'Revenues', yForecast: 15_640_000, todate: 2_606_667, execution: 3_395_500, pct: 130 },
  { label: 'Cost of Sales', yForecast: 5_682_000, todate: 947_000, execution: 519_500, pct: 55 },
  { label: 'Gross Profit', yForecast: 9_958_000, todate: 1_659_667, execution: 2_876_000, pct: 173, emphasis: true },
  { label: 'BU Fixed Costs', yForecast: 1_557_600, todate: 259_600, execution: 102_000, pct: 39 },
  { label: 'SU Fixed Costs', yForecast: 838_000, todate: 139_667, execution: 0, pct: 0 },
  { label: 'Total Fixed Costs', yForecast: 2_395_600, todate: 399_267, execution: 102_000, pct: 26, emphasis: true },
  { label: 'BU Variable Costs', yForecast: 405_200, todate: 67_533, execution: 2_000, pct: 3 },
  { label: 'SU Variable Costs', yForecast: 454_900, todate: 75_817, execution: 0, pct: 0 },
  { label: 'Total Variable Costs', yForecast: 860_100, todate: 143_350, execution: 2_000, pct: 1, emphasis: true },
  { label: 'Total OPEX', yForecast: 3_255_700, todate: 542_617, execution: 104_000, pct: 19, emphasis: true },
  { label: 'EBIT', yForecast: 6_702_300, todate: 1_117_050, execution: 2_772_000, pct: 248, emphasis: true },
]

export const monthlyBudgetPerformance: BudgetLine[] = [
  { label: 'Revenues', yForecast: 1_303_333, todate: 1_697_750, execution: 1_697_750, pct: 130 },
  { label: 'Cost of Sales', yForecast: 473_500, todate: 259_750, execution: 259_750, pct: 55 },
  { label: 'Gross Profit', yForecast: 829_833, todate: 1_438_000, execution: 1_438_000, pct: 173, emphasis: true },
  { label: 'BU Fixed Costs', yForecast: 129_800, todate: 51_000, execution: 51_000, pct: 39 },
  { label: 'SU Fixed Costs', yForecast: 69_833, todate: 0, execution: 0, pct: 0 },
  { label: 'Total Fixed Costs', yForecast: 199_633, todate: 51_000, execution: 51_000, pct: 26, emphasis: true },
  { label: 'BU Variable Costs', yForecast: 33_767, todate: 1_000, execution: 1_000, pct: 3 },
  { label: 'SU Variable Costs', yForecast: 37_908, todate: 0, execution: 0, pct: 0 },
  { label: 'Total Variable Costs', yForecast: 71_675, todate: 1_000, execution: 1_000, pct: 1, emphasis: true },
  { label: 'Total OPEX', yForecast: 271_308, todate: 52_000, execution: 52_000, pct: 19, emphasis: true },
  { label: 'EBIT', yForecast: 558_525, todate: 1_386_000, execution: 1_386_000, pct: 248, emphasis: true },
]

// Costs Analysis grouped bar chart (TODATE vs EXECUTION)
export const costsAnalysis = [
  { name: 'Cost of Sales', todate: 947_000, execution: 519_500 },
  { name: 'Total Fixed Costs', todate: 399_267, execution: 102_000 },
  { name: 'Total Variable Costs', todate: 143_350, execution: 2_000 },
  { name: 'Total OPEX', todate: 542_617, execution: 104_000 },
]

// Cost analysis by department (yearly)
export const costAnalysisByDept = [
  { department: 'Admin & Finances', yForecast: 2_601_700, todate: 433_617, execution: 314_000, pct: 12 },
  { department: 'Technical & Operation', yForecast: 454_000, todate: 75_667, execution: 4_000, pct: 1 },
  { department: 'Marketing & Sales', yForecast: 236_000, todate: 39_333, execution: 0, pct: 0 },
]

// Costs Breakdown (TODATE vs EXECUTION) by cost line
export const costsBreakdown = [
  { name: 'BU Fixed Costs', todate: 259_600, execution: 102_000 },
  { name: 'SU Fixed Costs', todate: 139_667, execution: 0 },
  { name: 'BU Variable Costs', todate: 67_533, execution: 2_000 },
  { name: 'SU Variable Costs', todate: 75_817, execution: 0 },
]

// Execution Level horizontal bars (% per budget line)
export const executionLevel = [
  { label: 'EBIT', pct: 248 },
  { label: 'Total OPEX', pct: 19 },
  { label: 'Total Variable Costs', pct: 1 },
  { label: 'SU Variable Costs', pct: 0 },
  { label: 'BU Variable Costs', pct: 3 },
  { label: 'Total Fixed Costs', pct: 26 },
  { label: 'SU Fixed Costs', pct: 0 },
  { label: 'BU Fixed Costs', pct: 39 },
  { label: 'Gross Profit', pct: 173 },
]

// Costs per Type (share of executed cost by type)
export const costsPerType = [
  { name: 'BU Fixed Costs', value: 102_000 },
  { name: 'BU Variable Costs', value: 2_000 },
  { name: 'Cost of Sales', value: 519_500 },
]

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'FC' ? 'USD' : currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
