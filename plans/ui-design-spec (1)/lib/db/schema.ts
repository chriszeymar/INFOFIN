import {
  pgTable,
  text,
  integer,
  serial,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const budgetGroups = pgTable('budget_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bucketType: text('bucket_type').notNull(), // 'BU' | 'SU'
  sortOrder: integer('sort_order').notNull().default(0),
})

export const budgetDepartments = pgTable('budget_departments', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const budgetLineItems = pgTable('budget_line_items', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  section: text('section').notNull(), // REVENUES | COS | FIXED_COSTS | VARIABLE_COSTS
  classification: text('classification'), // ADMIN_FIN | TECH_OPS | MKT_SALES | null
  label: text('label').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const budgetValues = pgTable(
  'budget_values',
  {
    id: serial('id').primaryKey(),
    lineItemId: text('line_item_id').notNull(),
    departmentId: text('department_id').notNull(),
    year: integer('year').notNull(),
    forecast: numeric('forecast').notNull().default('0'),
    execution: numeric('execution').notNull().default('0'),
  },
  (t) => ({
    uniq: uniqueIndex('budget_values_unique').on(
      t.lineItemId,
      t.departmentId,
      t.year,
    ),
  }),
)
