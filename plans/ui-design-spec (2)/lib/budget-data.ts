// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Budget Data Model
// Hierarchy: BucketType → DepartmentGroup → Department
// Financial sections:
//   BU  → REVENUES | COS | FIXED_COSTS | VARIABLE_COSTS  (→ Gross Margin → EBIT)
//   SU  → FIXED_COSTS | VARIABLE_COSTS                   (→ TOTAL OPEX)
// Classification within Fixed/Variable: ADMIN_FIN | TECH_OPS | MKT_SALES
// ─────────────────────────────────────────────────────────────────────────────

export type BucketType = 'BU' | 'SU'
export type SectionType = 'REVENUES' | 'COS' | 'FIXED_COSTS' | 'VARIABLE_COSTS'
export type ClassificationType = 'ADMIN_FIN' | 'TECH_OPS' | 'MKT_SALES'

export const CLASSIFICATION_LABELS: Record<ClassificationType, string> = {
  ADMIN_FIN: 'Admin & Finances',
  TECH_OPS: 'Technical & Operations',
  MKT_SALES: 'Marketing & Sales',
}

export type BudgetLineItem = {
  id: string
  label: string
  forecast: number
  execution: number
}

export type BudgetClassification = {
  type: ClassificationType
  items: BudgetLineItem[]
}

export type BudgetSection = {
  type: SectionType
  /** Only FIXED_COSTS and VARIABLE_COSTS have classifications */
  classifications?: BudgetClassification[]
  /** REVENUES and COS are flat lists */
  items?: BudgetLineItem[]
}

export type Department = {
  id: string
  name: string
  sections: BudgetSection[]
}

export type DepartmentGroup = {
  id: string
  name: string
  bucketType: BucketType
  departments: Department[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function li(id: string, label: string, forecast: number, execPct?: number): BudgetLineItem {
  const execution = execPct !== undefined ? Math.round(forecast * execPct) : 0
  return { id, label, forecast, execution }
}

export function sumItems(items: BudgetLineItem[]) {
  return {
    forecast: items.reduce((a, i) => a + i.forecast, 0),
    execution: items.reduce((a, i) => a + i.execution, 0),
  }
}

export function execPct(forecast: number, execution: number) {
  if (forecast === 0) return null
  return Math.round((execution / forecast) * 100)
}

export function getSectionTotals(section: BudgetSection) {
  if (section.items) return sumItems(section.items)
  const allItems = (section.classifications ?? []).flatMap((c) => c.items)
  return sumItems(allItems)
}

export function getDeptSummary(dept: Department, bucketType: BucketType) {
  const get = (type: SectionType) => {
    const s = dept.sections.find((s) => s.type === type)
    return s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
  }
  const rev = get('REVENUES')
  const cos = get('COS')
  const fixed = get('FIXED_COSTS')
  const variable = get('VARIABLE_COSTS')
  const grossMargin = { forecast: rev.forecast - cos.forecast, execution: rev.execution - cos.execution }
  const opex = { forecast: fixed.forecast + variable.forecast, execution: fixed.execution + variable.execution }
  const ebit = { forecast: grossMargin.forecast - opex.forecast, execution: grossMargin.execution - opex.execution }
  return { rev, cos, grossMargin, fixed, variable, opex, ebit, bucketType }
}

// ─── BU: Banking & Digital ────────────────────────────────────────────────────

const buFixedClassifications = (prefix: string, adminScale = 1, techScale = 1): BudgetClassification[] => [
  {
    type: 'ADMIN_FIN',
    items: [
      li(`${prefix}-af-1`, 'Payroll expenses',                    Math.round(240_000 * adminScale), 0.17),
      li(`${prefix}-af-2`, 'Medical expenses',                    Math.round(1_000 * adminScale),   0),
      li(`${prefix}-af-3`, 'Insurance expenses',                  Math.round(800 * adminScale),     0),
      li(`${prefix}-af-4`, 'Rent expenses',                       Math.round(45_000 * adminScale),  0.14),
      li(`${prefix}-af-5`, 'Office supplies',                     Math.round(6_000 * adminScale),   0.33),
      li(`${prefix}-af-6`, 'Janitorial expenses',                 Math.round(2_400 * adminScale),   0),
      li(`${prefix}-af-7`, 'Corporate fees – Fixed Opex',         Math.round(1_200 * adminScale),   0),
    ],
  },
  {
    type: 'TECH_OPS',
    items: [
      li(`${prefix}-to-1`, 'Computer, telephone & internet',      Math.round(2_000 * techScale),    0.25),
      li(`${prefix}-to-2`, 'Permits, licences & subscriptions',   Math.round(800 * techScale),      0),
    ],
  },
  {
    type: 'MKT_SALES',
    items: [
      li(`${prefix}-ms-1`, 'Marketing & advertising',             Math.round(3_600 * adminScale),   0),
    ],
  },
]

const buVariableClassifications = (prefix: string, adminScale = 1, techScale = 1): BudgetClassification[] => [
  {
    type: 'ADMIN_FIN',
    items: [
      li(`${prefix}-av-1`, 'Transport costs',                     Math.round(1_000 * adminScale),   0.10),
      li(`${prefix}-av-2`, 'Meals & entertainment',               Math.round(5_000 * adminScale),   0.06),
      li(`${prefix}-av-3`, 'Business travel',                     Math.round(60_000 * adminScale),  0.08),
      li(`${prefix}-av-4`, 'Automobile expenses',                 Math.round(8_000 * adminScale),   0),
      li(`${prefix}-av-5`, 'Professional fees',                   Math.round(60_000 * adminScale),  0.17),
      li(`${prefix}-av-6`, 'Depreciation charges',                Math.round(12_000 * adminScale),  0),
      li(`${prefix}-av-7`, 'Bank charges – MM',                   Math.round(4_000 * adminScale),   0),
      li(`${prefix}-av-8`, 'Miscellaneous loss',                  Math.round(800 * adminScale),     0),
      li(`${prefix}-av-9`, 'Charitable & contribution',           Math.round(10_000 * adminScale),  0.02),
      li(`${prefix}-av-10`, 'Miscellaneous expenses',             Math.round(3_000 * adminScale),   0),
      li(`${prefix}-av-11`, 'Management fees',                    Math.round(200_000 * adminScale), 0),
      li(`${prefix}-av-12`, 'Other tax',                          Math.round(1_500 * adminScale),   0),
      li(`${prefix}-av-13`, 'Corporate fees',                     Math.round(2_000 * adminScale),   0),
    ],
  },
  {
    type: 'TECH_OPS',
    items: [
      li(`${prefix}-tv-1`, 'Small tools',                         Math.round(1_200 * techScale),    0),
      li(`${prefix}-tv-2`, 'Repair & maintenance',                Math.round(1_800 * techScale),    0),
      li(`${prefix}-tv-3`, 'Project expenses',                    Math.round(4_000 * techScale),    0),
      li(`${prefix}-tv-4`, 'Education & training',                Math.round(5_000 * techScale),    0.10),
    ],
  },
  {
    type: 'MKT_SALES',
    items: [
      li(`${prefix}-mv-1`, 'Marketing costs / promotion',         Math.round(15_000 * adminScale),  0),
      li(`${prefix}-mv-2`, 'Marketing costs / communication',     Math.round(8_000 * adminScale),   0),
      li(`${prefix}-mv-3`, 'Marketing costs / field marketing',   Math.round(5_000 * adminScale),   0),
    ],
  },
]

function makeBUDept(id: string, name: string, revScale: number, cosScale: number, fixedAdminScale: number, techScale: number): Department {
  const revItems: BudgetLineItem[] = [
    li(`${id}-r1`, 'Sales – Software',                          Math.round(500_000 * revScale),   0.22),
    li(`${id}-r2`, 'Sales – Cards & maintenance',               Math.round(1_500_000 * revScale), 0.18),
    li(`${id}-r3`, 'Sales – Services supply & maintenance',     Math.round(800_000 * revScale),   0.15),
    li(`${id}-r4`, 'CORPORATE revenues',                        Math.round(2_000_000 * revScale), 0.13),
    li(`${id}-r5`, 'Sales – Card digital platforms',            Math.round(300_000 * revScale),   0.08),
    li(`${id}-r6`, 'Sales – E-platform products',               Math.round(400_000 * revScale),   0.11),
    li(`${id}-r7`, 'VISA funding',                              Math.round(600_000 * revScale),   0.19),
    li(`${id}-r8`, 'Sales – Software (Layer IT)',               Math.round(200_000 * revScale),   0),
    li(`${id}-r9`, 'Sales – Cloud services',                    Math.round(350_000 * revScale),   0.07),
    li(`${id}-r10`, 'Other revenues',                           Math.round(90_000 * revScale),    0.05),
  ]
  const cosItems: BudgetLineItem[] = [
    li(`${id}-c1`, 'Purchases – Cards / printing / supplies',   Math.round(300_000 * cosScale),   0.15),
    li(`${id}-c2`, 'COS – Services supply',                     Math.round(400_000 * cosScale),   0.08),
    li(`${id}-c3`, 'COS – Prepaid card (card boarding)',        Math.round(150_000 * cosScale),   0.12),
    li(`${id}-c4`, 'COS – Stamp & barcode',                     Math.round(40_000 * cosScale),    0),
    li(`${id}-c5`, 'COS – Co-payments / digital',               Math.round(60_000 * cosScale),    0),
    li(`${id}-c6`, 'VISA – VISA EXPENSES',                      Math.round(200_000 * cosScale),   0.22),
    li(`${id}-c7`, 'Other direct cost',                         Math.round(30_000 * cosScale),    0),
  ]
  return {
    id,
    name,
    sections: [
      { type: 'REVENUES', items: revItems },
      { type: 'COS', items: cosItems },
      { type: 'FIXED_COSTS', classifications: buFixedClassifications(id, fixedAdminScale, techScale) },
      { type: 'VARIABLE_COSTS', classifications: buVariableClassifications(id, fixedAdminScale, techScale) },
    ],
  }
}

// ─── SU Fixed / Variable shared factory ──────────────────────────────────────

function makeSUDept(id: string, name: string, adminScale: number, techScale: number): Department {
  return {
    id,
    name,
    sections: [
      { type: 'FIXED_COSTS', classifications: buFixedClassifications(id, adminScale, techScale) },
      { type: 'VARIABLE_COSTS', classifications: buVariableClassifications(id, adminScale, techScale) },
    ],
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const departmentGroups: DepartmentGroup[] = [
  // BU groups
  {
    id: 'banking-digital',
    name: 'Banking & Digital',
    bucketType: 'BU',
    departments: [
      makeBUDept('infoset-sarl',  'INFOSET SARL',           0.6, 0.6, 0.5, 0.3),
      makeBUDept('bd-monetique',  'Banking & Digital – Monetique', 0.8, 0.8, 0.7, 0.4),
      makeBUDept('total-banking', 'Total Banking',           1.0, 1.0, 1.0, 0.6),
      makeBUDept('genisys-cloud', 'Genisys – Cloud',         0.4, 0.4, 0.3, 0.8),
      makeBUDept('achnix',        'Achnix',                  0.3, 0.3, 0.25, 0.5),
    ],
  },
  {
    id: 'it-cloud',
    name: 'IT & Cloud',
    bucketType: 'BU',
    departments: [
      makeBUDept('it-infra',      'IT Infrastructure',       0.5, 0.45, 0.6, 1.2),
      makeBUDept('it-dev',        'Software Development',    0.4, 0.35, 0.5, 1.0),
      makeBUDept('it-support',    'IT Support',              0.2, 0.2,  0.3, 0.6),
    ],
  },
  // SU groups
  {
    id: 'dg-admin-fin',
    name: 'DG, Admin & Finance',
    bucketType: 'SU',
    departments: [
      makeSUDept('dg',              'DG',                    0.9, 0.2),
      makeSUDept('fpa',             'FP&A',                  0.7, 0.3),
      makeSUDept('admin-acc',       'Admin & Accounting',    1.0, 0.4),
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    bucketType: 'SU',
    departments: [
      makeSUDept('ops-logistics',   'Logistics',             0.6, 0.8),
      makeSUDept('ops-procurement', 'Procurement',           0.5, 0.5),
    ],
  },
]

export const BUCKET_GROUPS: Record<BucketType, DepartmentGroup[]> = {
  BU: departmentGroups.filter((g) => g.bucketType === 'BU'),
  SU: departmentGroups.filter((g) => g.bucketType === 'SU'),
}

export const YEARS = [2026, 2025, 2024]
