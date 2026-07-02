export type RequestStatus =
  | 'posted'
  | 'under_review'
  | 'approved'
  | 'completed'
  | 'declined'

export const STATUS_META: Record<
  RequestStatus,
  { label: string; variant: 'neutral' | 'default' | 'warning' | 'purple' | 'success' | 'danger' }
> = {
  posted:       { label: 'Posted', variant: 'default' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved:     { label: 'Approved', variant: 'success' },
  completed:    { label: 'Completed', variant: 'neutral' },
  declined:     { label: 'Declined', variant: 'danger' },
}

export const APPROVAL_STEPS = [
  'Posted',
  'Under Review',
  'Approved',
  'Completed',
] as const

export type SpendRequest = {
  id: string
  ref: string
  department: string
  category: string
  vendor: string
  amount: number
  currency: 'USD' | 'FC'
  fcAmount: number
  exchangeRate: number
  status: RequestStatus
  date: string
  description: string
  requester: string
  reportedBy: string
  assignedTo: string
  attachments: { name: string; size: string }[]
  timeline: {
    step: string
    actor: string
    state: 'done' | 'current' | 'declined' | 'pending'
    date?: string
    comment?: string
  }[]
}

export const spendRequests: SpendRequest[] = [
  {
    id: '1',
    ref: 'SR-2026-0148',
    department: 'Marketing',
    category: 'Advertising',
    vendor: 'Meridian Media',
    amount: 48000,
    currency: 'USD',
    fcAmount: 48000,
    exchangeRate: 1,
    status: 'under_review',
    date: '2026-06-18',
    description:
      'Q3 digital advertising campaign across paid social and search to support the product launch.',
    requester: 'Dana Whitfield',
    reportedBy: 'Dana Whitfield',
    assignedTo: 'Marcus Lee',
    attachments: [
      { name: 'campaign-brief.pdf', size: '1.2 MB' },
      { name: 'vendor-quote.pdf', size: '430 KB' },
    ],
    timeline: [
      { step: 'Posted', actor: 'Dana Whitfield', state: 'done', date: '2026-06-18' },
      { step: 'Under Review', actor: 'Marcus Lee', state: 'current' },
      { step: 'Approved', actor: 'Pending', state: 'pending' },
      { step: 'Completed', actor: 'Pending', state: 'pending' },
    ],
  },
  {
    id: '2',
    ref: 'SR-2026-0147',
    department: 'Engineering',
    category: 'Software Licenses',
    vendor: 'CloudStack Inc.',
    amount: 22500,
    currency: 'USD',
    fcAmount: 22500,
    exchangeRate: 1,
    status: 'under_review',
    date: '2026-06-17',
    description: 'Annual renewal of cloud infrastructure monitoring and observability suite.',
    requester: 'Priya Nair',
    reportedBy: 'Priya Nair',
    assignedTo: 'Liam Chen',
    attachments: [{ name: 'renewal-invoice.pdf', size: '680 KB' }],
    timeline: [
      { step: 'Posted', actor: 'Priya Nair', state: 'done', date: '2026-06-17' },
      { step: 'Under Review', actor: 'Sofia Alvarez', state: 'done', date: '2026-06-18', comment: 'Approved, within budget.' },
      { step: 'Approved', actor: 'Liam Chen', state: 'current' },
      { step: 'Completed', actor: 'Pending', state: 'pending' },
    ],
  },
  {
    id: '3',
    ref: 'SR-2026-0146',
    department: 'Operations',
    category: 'Facilities',
    vendor: 'Northgate Services',
    amount: 91000,
    currency: 'FC',
    fcAmount: 1310400,
    exchangeRate: 14.4,
    status: 'completed',
    date: '2026-06-15',
    description: 'Office refurbishment for the regional headquarters, phase one.',
    requester: 'Tomas Berg',
    reportedBy: 'Tomas Berg',
    assignedTo: 'Eleanor Voss',
    attachments: [
      { name: 'refurb-scope.pdf', size: '2.1 MB' },
      { name: 'three-bids.xlsx', size: '95 KB' },
    ],
    timeline: [
      { step: 'Posted', actor: 'Tomas Berg', state: 'done', date: '2026-06-15' },
      { step: 'Under Review', actor: 'Sofia Alvarez', state: 'done', date: '2026-06-16' },
      { step: 'Approved', actor: 'Liam Chen', state: 'done', date: '2026-06-17', comment: 'Capex confirmed.' },
      { step: 'Completed', actor: 'Eleanor Voss', state: 'current' },
    ],
  },
  {
    id: '4',
    ref: 'SR-2026-0145',
    department: 'Sales',
    category: 'Travel',
    vendor: 'Globe Travel Co.',
    amount: 12750,
    currency: 'USD',
    fcAmount: 12750,
    exchangeRate: 1,
    status: 'completed',
    date: '2026-06-12',
    description: 'Customer conference attendance and client visits across the EMEA region.',
    requester: 'Hannah Okafor',
    reportedBy: 'Hannah Okafor',
    assignedTo: 'Eleanor Voss',
    attachments: [{ name: 'travel-itinerary.pdf', size: '320 KB' }],
    timeline: [
      { step: 'Posted', actor: 'Hannah Okafor', state: 'done', date: '2026-06-12' },
      { step: 'Under Review', actor: 'Marcus Lee', state: 'done', date: '2026-06-13' },
      { step: 'Approved', actor: 'Liam Chen', state: 'done', date: '2026-06-13' },
      { step: 'Completed', actor: 'Eleanor Voss', state: 'done', date: '2026-06-14', comment: 'Approved.' },
    ],
  },
  {
    id: '5',
    ref: 'SR-2026-0144',
    department: 'Marketing',
    category: 'Events',
    vendor: 'Summit Events',
    amount: 64000,
    currency: 'USD',
    fcAmount: 64000,
    exchangeRate: 1,
    status: 'declined',
    date: '2026-06-10',
    description: 'Sponsorship of industry trade show booth and hospitality suite.',
    requester: 'Dana Whitfield',
    reportedBy: 'Dana Whitfield',
    assignedTo: 'Liam Chen',
    attachments: [{ name: 'sponsorship-deck.pdf', size: '4.8 MB' }],
    timeline: [
      { step: 'Posted', actor: 'Dana Whitfield', state: 'done', date: '2026-06-10' },
      { step: 'Under Review', actor: 'Marcus Lee', state: 'done', date: '2026-06-11' },
      { step: 'Approved', actor: 'Liam Chen', state: 'declined', date: '2026-06-12', comment: 'Exceeds remaining events budget for the quarter.' },
      { step: 'Completed', actor: 'Pending', state: 'pending' },
    ],
  },
  {
    id: '6',
    ref: 'SR-2026-0143',
    department: 'Engineering',
    category: 'Hardware',
    vendor: 'TechSupply Ltd.',
    amount: 8900,
    currency: 'USD',
    fcAmount: 8900,
    exchangeRate: 1,
    status: 'posted',
    date: '2026-06-20',
    description: 'Replacement workstations for the platform team.',
    requester: 'Priya Nair',
    reportedBy: 'Priya Nair',
    assignedTo: 'Priya Nair',
    attachments: [],
    timeline: [
      { step: 'Posted', actor: 'Priya Nair', state: 'current' },
      { step: 'Under Review', actor: 'Pending', state: 'pending' },
      { step: 'Approved', actor: 'Pending', state: 'pending' },
      { step: 'Completed', actor: 'Pending', state: 'pending' },
    ],
  },
  {
    id: '7',
    ref: 'SR-2026-0142',
    department: 'Operations',
    category: 'Logistics',
    vendor: 'FastFreight',
    amount: 15600,
    currency: 'USD',
    fcAmount: 15600,
    exchangeRate: 1,
    status: 'completed',
    date: '2026-06-08',
    description: 'Quarterly freight and distribution contract top-up.',
    requester: 'Tomas Berg',
    reportedBy: 'Tomas Berg',
    assignedTo: 'Eleanor Voss',
    attachments: [{ name: 'contract.pdf', size: '510 KB' }],
    timeline: [
      { step: 'Posted', actor: 'Tomas Berg', state: 'done', date: '2026-06-08' },
      { step: 'Under Review', actor: 'Sofia Alvarez', state: 'done', date: '2026-06-09' },
      { step: 'Approved', actor: 'Liam Chen', state: 'done', date: '2026-06-09' },
      { step: 'Completed', actor: 'Eleanor Voss', state: 'done', date: '2026-06-10' },
    ],
  },
]

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
  { category: 'Events', department: 'Marketing', budget: 220000, spent: 268000 },
  { category: 'Travel', department: 'Sales', budget: 140000, spent: 161500 },
  { category: 'Facilities', department: 'Operations', budget: 310000, spent: 332000 },
  { category: 'Software Licenses', department: 'Engineering', budget: 180000, spent: 192400 },
]

export const budgetRows = [
  { category: 'Advertising', forecast: 480000, actual: 312000 },
  { category: 'Events', forecast: 220000, actual: 268000 },
  { category: 'Travel', forecast: 140000, actual: 121000 },
  { category: 'Software Licenses', forecast: 180000, actual: 192400 },
  { category: 'Hardware', forecast: 260000, actual: 188000 },
  { category: 'Facilities', forecast: 310000, actual: 332000 },
  { category: 'Logistics', forecast: 240000, actual: 176000 },
  { category: 'Professional Services', forecast: 200000, actual: 154000 },
]

export const departments = [
  'Marketing',
  'Engineering',
  'Operations',
  'Sales',
  'Finance',
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
  { name: 'Marketing', unit: 'BU', group: 'Commercial' },
  { name: 'Sales', unit: 'BU', group: 'Commercial' },
  { name: 'Engineering', unit: 'SU', group: 'Technology' },
  { name: 'Operations', unit: 'SU', group: 'Supply' },
  { name: 'Finance', unit: 'SU', group: 'Corporate' },
]

export const masterUsers = [
  { email: 'dana.whitfield@infoset.com', role: 'Requester', department: 'Marketing', active: true },
  { email: 'marcus.lee@infoset.com', role: 'Director', department: 'Commercial', active: true },
  { email: 'liam.chen@infoset.com', role: 'FP&A', department: 'Finance', active: true },
  { email: 'eleanor.voss@infoset.com', role: 'Managing Director', department: 'Executive', active: true },
  { email: 'priya.nair@infoset.com', role: 'Requester', department: 'Engineering', active: true },
  { email: 'tomas.berg@infoset.com', role: 'Requester', department: 'Operations', active: false },
]

export const masterVendors = [
  { name: 'Meridian Media', category: 'Advertising', country: 'United States' },
  { name: 'CloudStack Inc.', category: 'Software Licenses', country: 'United States' },
  { name: 'Northgate Services', category: 'Facilities', country: 'United Kingdom' },
  { name: 'Globe Travel Co.', category: 'Travel', country: 'Germany' },
  { name: 'Summit Events', category: 'Events', country: 'United States' },
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
