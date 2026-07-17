# InfoFin — Internal Walkthrough

> Casual run-through of where we are. Same flow as the client presentation deck.
> Audience: Business Analysts & Stakeholders. No dev jargon, just what it does.

---

## Introduction — Setting the Tone

- This is an open discussion — walk through what we've built, then get their input
- Nothing is set in stone — every decision is up for discussion
- Show the platform, explain the thinking, then open the floor
- Goal: alignment — make sure we're building the right thing before going further

---

## The Problem (As We Understand It)

- Expense management runs on Excel today — each department has their own sheet, no single source of truth
- Spend requests happen informally — no structured approval chain, no clear record of who approved what
- FPA and MD have to manually pull numbers together just to see where the company stands
- Budget tracking is reactive — you find out you're overspent after the fact, not before

---

## What InfoFin Aims to Do (At a High Level)

- One central place for every spend request across every department
- A clear approval chain — everyone knows who needs to sign off, and everything is recorded
- Real-time budget visibility — see where you stand at any moment, not at month-end
- Live dashboards that replace the reports currently compiled manually
- Don't go through every feature — touch the big pieces and let them tell us where to go deeper

---

## The Org Structure — We Modeled What They Already Have

- **Business Units (BU)** — the revenue-generating side:
  - Banking & Digital: CIRRUS - DIGITAL, INFOSET SARL - MONETIQUE
  - IT & Cloud: GENISYS - CLOUD, AGMUX
- **Support Units (SU)** — the cost-center side:
  - DG, Admin & Fin: DG, FPA, ADMIN & ACCOUNTING
- Each department rolls up under its BU or SU group → "Total Banking," "Total IT," or "Total Group" at a glance
- Departments and accounts sync automatically from Odoo — no manual setup

---

## The Financial Categories — Their Chart of Accounts

- Every line item from the existing Excel workbook is loaded in the system
- **Revenues** (BU only) — hardware, software, cards, digital platforms, Visa funding, etc.
- **Cost of Sales** (BU only) — purchases for resale, card production, cloud services, etc.
- **Fixed Costs / OPEX** — payroll, rent, insurance, permits, subscriptions, etc.
- **Variable Costs / OPEX** — transport, travel, marketing, professional fees, repairs, training, etc.
- Organized under three classifications: Admin & Finances, Technical & Operations, Marketing & Sales
- System calculates **Gross Margin**, **Total OPEX**, and **EBIT** automatically
- Master data is fully editable through the UI — no developer needed to add or change categories
- Odoo syncs ~2,500 accounts; users enhance them with classifications (Fixed vs Variable, etc.)

---

## Approval Workflow — How a Request Moves

- Every spend request follows a structured chain:
  1. **Financial Analyst** submits — what they need, category, amount, vendor, attachments
  2. **FPA Reviewer** checks — validates against budget, business justification
  3. **FPA Approver** signs off — final approval authority
  4. **Analyst** marks it complete — funds disbursed, loop closed
- Statuses: `POSTED → UNDER_REVIEW → APPROVED → COMPLETED`
- At any stage: `→ DECLINED` — requester gets notified with the reason
- Every step is timestamped — who acted, when, with what comments — fully auditable
- Exchange rate (USD/FC) locks at creation time — no surprises later
- Multi-currency: amounts tracked in both USD and Congolese Franc

---

## Roles & Access — How Every Login Is Scoped

- Each user gets a login tied to their role and department
- Department assignment controls what data they see — automatic, no manual filtering

| Role | What They Can Do | What They See |
|---|---|---|
| **Financial Analyst** | Create and submit requests for their department | Only their own department's data |
| **FPA Reviewer** | Validate against budget, move to Under Review or Decline | All departments — full picture |
| **FPA Approver** | Final approval authority | Everything across the organization |
| **Administrateur** | Manage master data — categories, users, vendors, system settings | Full system access |

- User management through the interface — add people, assign roles, activate/deactivate
- Demo accounts ready for the session (see below)

---

## The Dashboard — What's Built

- **Home screen** after login — snapshot of where the company stands
- **KPI Cards** — Total Budget, Total Spent, Remaining, EBIT (live from Odoo + budgets)
- **Monthly Trend Chart** — revenue vs OPEX bars, month by month (YTD through selected month)
- **Cost Breakdown Donut** — Fixed Costs vs Variable Costs vs COS — what's eating the budget?
- **Overspent Table** — categories where spending exceeds budget. Quick red flags.
- **Filters** — pick a year, department, toggle BU/SU views
- Analyst → sees their department only (basic dashboard)
- Reviewer / Approver / Admin → sees everything (full dashboard)
- Running on **live Odoo data** — actuals synced, budget targets entered. Real numbers, not mock data.

---

## Spend Requests — Day-to-Day Operations

- **List view** — table filtered by role/department, status filters, click to open detail
- **Create form** — pick department, category (tree), vendor, amount, currency, attach files
- **Detail slide-over** — full timeline: who did what, when, with what comments
- **Actions** — transition status based on your role (review, approve, decline, complete)
- **Assignment** — requests can be assigned to a specific reviewer after posting
- Every status change writes to audit history — nothing disappears

---

## Budgets — The Matrix

Replaces the Excel matrix the finance team builds manually.

- **Rows** = Departments, grouped by BU/SU
- **Columns** = Cost categories in sections: Revenues → COS → Fixed Costs → Variable Costs
- **Three data layers per cell** (click to drill down):
  - **Actual** — from Odoo, read-only. What really happened.
  - **Target** — the budget goal, set by FPA/Admin in the grid
  - **Adjustment** — manual corrections for offline expenses or reclassifications
- Auto-calculated: Gross Margin, Total OPEX, EBIT, % Used
- View scoped by role; edits locked to FPA Approver and Admin only

---

## Master Data (Admin)

- **Categories** — three-tier hierarchy, editable in the UI
- **Departments** — org structure under BU/SU buckets
- **Vendors** — synced from Odoo, maintained as approved supplier list
- **Financial Groups** — Revenue, COS, Fixed, Variable
- Changes here ripple through request forms, budget grid, and reports
- Admin only — keeps the reference data clean and controlled

---

## User Management (Admin)

- Add users, assign roles and departments
- Activate / deactivate (no deleting — audit trail stays intact)
- Change roles when someone moves positions
- Four demo accounts ready to go

---

## Odoo Integration — The Vision

- **What flows from Odoo → InfoFin (built & running):**
  - Departments and accounts (master data)
  - Journal entries → aggregated into actuals (6,300+ lines processed)
  - Vendors
- **What InfoFin adds on top:**
  - Budget targets and forecasts (Odoo doesn't do this)
  - The approval workflow (Odoo doesn't do this either)
  - Dashboards and reporting
- **The vision (not built yet):**
  - Approved requests flow InfoFin → Odoo for procurement and payment
  - Payment data flows back → compare "what was requested" vs "what was actually paid"
- **The split:** Odoo = execution (what happened). InfoFin = planning + control (what should happen + are we on track).

---

## Where We Are Right Now

| Feature | Status |
|---|---|
| Login & role-based access | ✅ Done |
| Spend request creation + attachments | ✅ Done |
| Approval workflow (Post → Review → Approve → Complete) | ✅ Done |
| Dashboard — KPIs, charts, filters, live data | ✅ Done |
| Budget matrix grid — Actuals + Targets + Adjustments | ✅ Done |
| Odoo sync — master data + journal entries → actuals | ✅ Done |
| Master data management (categories, departments, vendors) | ✅ Done |
| User management (add, assign, activate/deactivate) | ✅ Done |
| Multi-currency — USD & FC with locked exchange rates | ✅ Done |
|||
| Reimbursements page | 🔜 Coming soon |
| Reports page | 🔜 Coming soon |
| Purchase Orders page | 🔜 Coming soon |
| Export to Excel / PDF | 🔜 Planned |
| Email notifications on status changes | 🔜 Planned |
| Budget reallocation workflow | 🔜 Planned |
| InfoFin → Odoo push (approved requests to procurement) | 🔜 Planned |

---

## Demo Access (For Reference)

| Email | Password | Role | Scope |
|---|---|---|---|
| admin@infoset.cd | admin | Administrateur | Full access |
| analyst.cirrus@infoset.cd | pass | Financial Analyst | CIRRUS only |
| reviewer@infoset.cd | pass | FPA Reviewer | All departments |
| approver@infoset.cd | pass | FPA Approver | All departments |

---

# Discussion — Open Questions

## The Problem Space

- Does our understanding of the current process match their reality? What are we missing?
- What's actually worse than we think? What's less of a problem?
- What's the biggest pain point in their current process that we haven't addressed?

## Org Structure & Categories

- Is the department structure correct? Any departments missing?
- Do the BU/SU groupings make sense for how they actually report?
- Does the category structure match how they think about costs? Reclassifications needed?
- Are there categories they track today that aren't in the system yet?

## Approval Workflow

- Does the 3-step chain (Analyst → Reviewer → Approver) match their actual process?
- Are there exceptions — certain amounts or categories that skip a level?
- Do they need parallel approvals or just sequential?
- Who can submit requests — anyone, or designated people per department?
- What happens when someone is on leave — delegate or backup approver?

## Roles, Access & User Management

- Do these four roles match their team structure? Any roles missing?
- Should one person be able to hold multiple roles?
- Do they need a read-only role — view everything, approve nothing?
- How do they handle people who work across multiple departments?
- Integration with existing directory (AD, Google Workspace) or standalone login fine?
- What's their process when someone leaves or changes roles — who manages that?

## Dashboard & Reporting

- What numbers do they look at first every morning?
- What reports do they currently produce that should be live on the dashboard?
- What reports do they present to the board that this system should eventually produce?
- What's missing from the dashboard right now?

## Odoo Integration

- Does the split make sense — forecasting/budgeting here, execution/payments in Odoo?
- Which accounts feed which way? Sync all accounts or only specific ones?
- Which Odoo accounts map to which InfoFin categories?
- Expenses outside Odoo — petty cash, manual payments, inter-company transfers? How to handle?
- How often should data sync — real-time, daily, weekly?
- Do they maintain vendors in Odoo today? Is that the master vendor list?
- How do they currently reconcile planned spend against actual payments?

## Compliance & Process

- Specific compliance or audit requirements we need to consider?
- How do budget reallocations work today — who approves moving money between categories?
- Regulatory or tax considerations that should influence how we track expenses?

## Rollout & Next Steps

- What's a realistic timeline for getting real data in and starting to use this?
- Which department would be the best pilot group?
- Who else needs to be in the next conversation?
- What's the one thing they'd need to see before feeling comfortable rolling this out?

---

> *Last updated: July 2026 — internal prep doc, mirrors client presentation flow*
