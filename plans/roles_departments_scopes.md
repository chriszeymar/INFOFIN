# InfoFin — Roles, Departments & Data Scoping
> Meeting reference document — June 2026

---

## Role Definitions

| # | Role Name | Meaning | Plain English |
|---|-----------|---------|---------------|
| 1 | **Encodeur** | Encoder / Requester | Submits spend requests for their department |
| 2 | **Directeur BU/SU** | Business Unit / Support Unit Director | Approves requests at Tier 1 for their group |
| 3 | **Validation FPA** | Financial Planning & Analysis | Validates budget availability at Tier 2 |
| 4 | **Val MD** | Managing Director | Final executive approval at Tier 3 |
| 5 | **Administrateur** | System Administrator | Manages users, categories, master data |

---

## Organizational Structure

```
                    ┌──────────────────────────────┐
                    │     BUSINESS UNITS (BU)       │
                    ├──────────────────┬───────────┤
                    │ Banking & Digital │ IT & Cloud│
                    ├────────┬─────────┼───────────┤
                    │ CIRRUS │ INFOSET │ GENISYS   │
                    │ DIGITAL│ MONETIQUE│ CLOUD    │
                    │        │         │           │
                    │        │         │ AGMUX     │
                    └────────┴─────────┴───────────┘

                    ┌──────────────────────────────┐
                    │      SUPPORT UNITS (SU)       │
                    ├──────────────────────────────┤
                    │        DG, Admin & Fin        │
                    ├────────┬─────────┬───────────┤
                    │   DG   │   FPA   │ ADMIN &   │
                    │        │         │ACCOUNTING │
                    └────────┴─────────┴───────────┘
```

### Departments (flat list)

| Group | Department |
|-------|-----------|
| **Banking & Digital** (BU) | CIRRUS - DIGITAL |
| **Banking & Digital** (BU) | INFOSET SARL - MONETIQUE |
| **IT & Cloud** (BU) | GENISYS - CLOUD |
| **IT & Cloud** (BU) | AGMUX |
| **DG, Admin & Fin** (SU) | DG |
| **DG, Admin & Fin** (SU) | FPA |
| **DG, Admin & Fin** (SU) | ADMIN & ACCOUNTING |

---

## Scope Matrix

| Role | Scope Boundary | Sees | Cannot See |
|------|---------------|------|------------|
| **Encodeur** | Own Department | Only their department's requests, budgets, history | Other departments entirely |
| **Directeur BU/SU** | Department Group | All departments in their group (e.g., Cirrus + Infoset) | Other groups (e.g., IT Cloud, DG/Admin/Fin) |
| **Validation FPA** | Global | All departments, all groups, all requests | Nothing — full visibility |
| **Val MD** | Global | Everything for final sign-off | Nothing — full visibility |
| **Administrateur** | System | Everything + master data editing | N/A (not in approval flow) |

---

## Example: Who sees a Cirrus spend request?

```
Request created by: user_a@cirrus.com (Encodeur, Cirrus department)

    ┌─────────────────────────────────────────────────┐
    │                  SPEND REQUEST                   │
    │              CIRRUS - DIGITAL                    │
    └─────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ┌─────────────┐     ┌───────────────┐     ┌──────────────┐
  │ Encodeur    │     │ Encodeur      │     │ Encodeur     │
  │ Cirrus      │     │ Infoset       │     │ Genisys      │
  │ ✅ SEES IT  │     │ ❌ CANNOT     │     │ ❌ CANNOT    │
  └─────────────┘     └───────────────┘     └──────────────┘

  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────┐
  │ Directeur         │  │ Directeur        │  │ FPA / MD     │
  │ Banking & Digital │  │ IT & Cloud       │  │ Admin        │
  │ ✅ SEES IT        │  │ ❌ CANNOT        │  │ ✅ SEES ALL  │
  └───────────────────┘  └──────────────────┘  └──────────────┘
```

---

## Approval Workflow

```
  ┌──────────────┐
  │  ENCODEUR    │
  │  Creates     │
  │  Draft       │
  └──────┬───────┘
         │ submits
         ▼
  ┌──────────────┐      ┌──────────────────┐
  │  TIER 1      │──────│  DECLINED        │
  │  DIRECTEUR   │ yes  │  Notify Encoder  │
  │  BU/SU       │──────│  with comments   │
  └──────┬───────┘      └──────────────────┘
         │ approves
         ▼
  ┌──────────────┐      ┌──────────────────┐
  │  TIER 2      │──────│  DECLINED        │
  │  FPA         │ yes  │  Notify Encoder  │
  │  (budget)    │──────│  with comments   │
  └──────┬───────┘      └──────────────────┘
         │ approves
         ▼
  ┌──────────────┐      ┌──────────────────┐
  │  TIER 3      │──────│  DECLINED        │
  │  VAL MD      │ yes  │  Notify Encoder  │
  │  (final)     │──────│  with comments   │
  └──────┬───────┘      └──────────────────┘
         │ approves
         ▼
  ┌──────────────────┐
  │  ✅ APPROVED     │
  │  Funds Authorized│
  └──────────────────┘
```

---

## Status Badges

| Status | Meaning |
|--------|---------|
| **Draft** | Not yet submitted |
| **PENDING_DIRECTOR** | Awaiting Tier 1 (Directeur) |
| **PENDING_FPA** | Awaiting Tier 2 (FPA budget validation) |
| **PENDING_MD** | Awaiting Tier 3 (MD final approval) |
| **APPROVED** | Fully authorized |
| **DECLINED** | Rejected at any tier |

---

## Current System Implementation Status

| Feature | Scope Enforced? | Notes |
|---------|----------------|-------|
| Spend Requests | ✅ Fully scoped | Server-side filter by role + department |
| Budgets | 🔧 Partial | `departmentId` parameter exists, auto-scope not yet wired |
| Reports | 🔧 Not yet | Needs scope integration |
| Master Data | 👑 Admin only | No department filter needed |
| Users | 👑 Admin only | No department filter needed |

---

## Discussion Questions for the Session

1. **Directeur visibility** — Should a Directeur see budgets/reports for their group only, or also read-only totals for other groups?
2. **Encodeur budget view** — Should an Encodeur see budget consumption for their department, or only their own spend requests?
3. **Over-budget behavior** — When a request exceeds the allocated budget, should the system **hard-block** it or just **warn** the approver?
4. **Notifications** — Who gets notified at each status transition? (Email, in-app, both?)
5. **Department groupings** — Are the current groups (Banking & Digital, IT & Cloud, DG/Admin/Fin) correct, or do they need realignment?
6. **Multi-currency display** — Should users see amounts in USD only, FC only, or both with the exchange rate?
