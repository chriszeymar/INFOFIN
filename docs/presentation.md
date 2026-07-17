# InfoFin — Client Touch Base: Discussion Guide
### First conversation — walk through the platform, then open the floor

---

## Introduction — Setting the Tone

- This is an open discussion — we want to walk you through what we've built, but more importantly, we want your input
- Nothing is set in stone — every decision is up for discussion
- We'll show you the platform, explain the thinking behind it, then open the floor for your feedback
- The goal today is alignment — making sure we're building the right thing before we go further

---

## The Problem (As We Understand It)

- Today, expense management runs on Excel — each department has their own sheet, no single source of truth
- Spend requests happen informally — no structured approval chain, no clear record of who approved what
- FPA and the MD have to manually pull numbers together just to see where the company stands
- Budget tracking is reactive — you find out you're overspent after the fact, not before

---

## What InfoFin Aims to Do (At a High Level)

- One central place for every spend request across every department
- A clear approval chain — everyone knows who needs to sign off, and everything is recorded
- Real-time budget visibility — see where you stand at any moment, not at month-end
- Live dashboards that replace the reports you currently compile manually
- We won't go through every feature today — we'll touch on the big pieces and let you tell us where to go deeper

---

## The Org Structure — We Modeled What You Already Have

- **Business Units (BU)** — the revenue-generating side:
  - Banking & Digital: CIRRUS - DIGITAL, INFOSET SARL - MONETIQUE
  - IT & Cloud: GENISYS - CLOUD, AGMUX
- **Support Units (SU)** — the cost-center side:
  - DG, Admin & Fin: DG, FPA, ADMIN & ACCOUNTING
- Each department rolls up under its BU or SU group for aggregate reporting — so you can see "Total Banking," "Total IT," or "Total Group" at a glance

---

## The Financial Categories — Your Chart of Accounts

- Every line item from the existing Excel workbook is loaded in the system:
  - **Revenues** (BU only — hardware sales, software, cards, digital platforms, Visa funding, etc.)
  - **Cost of Sales** (BU only — purchases for resale, card production, cloud services, etc.)
  - **Fixed Costs / OPEX** — payroll, rent, insurance, permits, subscriptions, etc.
  - **Variable Costs / OPEX** — transport, travel, marketing, professional fees, repairs, training, etc.
- Organized under three classifications: Admin & Finances, Technical & Operations, Marketing & Sales
- The system calculates Gross Margin, Total OPEX, and EBIT automatically
- Master data is fully editable through the interface — no developer needed to add or change categories

---

## Approval Workflow

- Every spend request follows a structured approval chain:
  1. A team member submits the request — what they need, which category, how much, which vendor
  2. It goes to their department Director for business justification review
  3. Then to FPA — they validate against the budget and check if funds are available
  4. Finally to the Managing Director for executive sign-off
- Every step is recorded — who approved, when, with what comments — fully auditable
- If anyone declines, the requester gets notified with the reason

---

## Roles & Access — How Every Login Is Scoped

- Each user gets a login tied to their role and department
- Their department assignment controls what data they see — automatically scoped, no manual filtering needed

| Role | What They Can Do | What They See |
|---|---|---|
| **Financial Analyst** | Create and submit spend requests for their department | Only their own department's data |
| **Director** | Approve/decline requests from their department | Their department's full budget and spend |
| **FPA Reviewer** | Validate against budget, approve/decline | All departments — sees the full picture |
| **FPA Approver / MD** | Final approval authority | Everything across the organization |
| **Administrateur** | Manage master data — categories, users, vendors | Full system access |

- User management is done through the interface — add people, assign roles, activate or deactivate

---

## The Dashboard — What's Built

- Customizable dashboard with KPI cards, charts, and tables
- Shows budget vs actual, overspent categories, revenue and OPEX trends, breakdowns by department
- Filter by year, by department, toggle between BU and SU views
- Each user can pick which widgets they want to see
- Currently running on sample data so you can see the layout and capabilities

---

## Odoo Integration — The Vision

- This is one of the most important topics we need to align on
- **The envisioned flow:**
  - Approved spend requests in InfoFin flow into Odoo for procurement and payment processing
  - Vendors from Odoo sync back into InfoFin so requesters select from the approved vendor list
  - Actual payment data from Odoo feeds back into InfoFin — so you can compare "what was requested" against "what was actually paid"
- **Key context:** We understand Odoo doesn't hold forecast/budget data — that's exactly why InfoFin exists. Budget planning and forecasting lives here, actual execution data comes from Odoo

---

## Where We Are Today

- What's built: the core platform — login, roles, spend request workflow, budget structure, dashboard
- What's using sample data: the dashboard (ready to connect to real data once we align on structure)
- What's next: your input drives the priorities

---

## Demo Access (For Reference)

| Email | Password | Role | Scope |
|---|---|---|---|
| admin@infoset.cd | admin | Administrateur | Full access |
| analyst.cirrus@infoset.cd | pass | Financial Analyst | CIRRUS only |
| reviewer@infoset.cd | pass | FPA Reviewer | All departments |
| approver@infoset.cd | pass | FPA Approver | All departments |

---

---

# Discussion — Open Questions

## The Problem Space

- Does our understanding of the current process match your reality? What are we missing?
- What's actually worse than we think? What's less of a problem?
- What's the biggest pain point in your current process that we haven't addressed?

---

## Org Structure & Categories

- Is the department structure correct? Are we missing any departments?
- Do the BU/SU groupings make sense for how you actually report?
- Does the category structure match how you think about costs? Any reclassifications needed?
- Are there categories you track today that aren't in the system yet?

---

## Approval Workflow

- Does the 4-step approval chain (Encoder → Director → FPA → MD) match your actual process?
- Are there exceptions — certain amounts or categories that skip a level?
- Do you need parallel approvals (multiple people at the same level) or just sequential?
- Who can submit requests — anyone, or only designated people per department?
- What happens when someone is on leave — is there a delegate or backup approver?

---

## Roles, Access & User Management

- Do these five roles match your team structure? Any roles missing?
- Should Directors only see their department, or should BU Directors see all BU departments?
- Can one person hold multiple roles? (e.g., someone who is both a Director AND does FPA review)
- Should the MD be able to approve at any stage, or only at the final step?
- Do you need a read-only role — someone who can view everything but not approve anything?
- How do you handle people who work across multiple departments?
- Do you need integration with an existing directory (Active Directory, Google Workspace)? Or is standalone login fine?
- What's your process when someone leaves or changes roles — who manages that?

---

## Dashboard & Reporting

- What numbers do you look at first every morning?
- What reports do you currently produce that you want to see live on the dashboard?
- What reports do you present to the board that this system should eventually produce?
- What's missing from the dashboard right now?

---

## Odoo Integration

- Does the split make sense — forecasting/budgeting in InfoFin, execution/payments in Odoo?
- Which accounts feed which way? Do we sync all accounts, or only specific ones?
- Which Odoo accounts map to which InfoFin categories?
- What's missing in Odoo? Are there expenses that happen outside Odoo — petty cash, manual payments, inter-company transfers? How should we handle those?
- How often do we need data to sync — real-time, daily, weekly?
- Do you maintain vendors in Odoo today? Is that the master vendor list, or do vendors exist elsewhere?
- How do you currently reconcile planned spend against actual payments? What does that process look like?

---

## Compliance & Process

- Are there specific compliance or audit requirements we need to consider?
- How do budget reallocations work today — who approves moving money between categories?
- Are there regulatory or tax considerations that should influence how we track expenses?

---

## Rollout & Next Steps

- What's a realistic timeline for getting real data in and starting to use this?
- Which department would be the best pilot group?
- Who else needs to be in the next conversation?
- What's the one thing you'd need to see before you'd feel comfortable rolling this out?
