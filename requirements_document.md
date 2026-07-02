# Expense Management & Budget Tracking System - Requirements Document

## 1. Executive Summary
The goal of this project is to digitize and automate the manual expense management process currently handled via Excel. The platform will serve as the central hub for all spend requests, providing real-time visibility into budget tracking, category allocations, and heavy financial reporting. 

To keep the system lightweight and maintainable, the architecture will feature a **thin backend**. The backend will primarily handle simple CRUD (Create, Read, Update, Delete) operations, state/status management, and data aggregation, relying on database views or the frontend for complex derivations and dashboarding.

---

## 2. Organizational Structure
The system distinguishes between two major department "buckets", under which the actual functional departments are organized. 

*   **Business Units (BU):**
    *   *Banking & Digital:* CIRRUS - DIGITAL, INFOSET SARL - MONETIQUE
    *   *IT & Cloud:* GENISYS - CLOUD, AGMUX
*   **Support Units (SU):**
    *   *DG, Admin & Fin:* DG, FPA, ADMIN & ACCOUNTING

*(Note: While BU departments operate to generate revenue and SU departments happen to operate as cost centers, the system tracks them primarily as organizational categories for budget mapping and roll-ups, rather than enforcing rigid expense/revenue rules internally. Aggregate "Total" groups like "Total Banking", "Total IT", and "Total I7 SARL" will be calculated dynamically by the system.)*

---

## 3. Financial Categories & Master Data
The items listed in the Excel sheets are not hardcoded static lists; rather, they form the **Master Data** of the system. Administrators can Create, Read, Update, or Delete (CRUD) these categories at any time.

The categorization strictly follows a 3-tier hierarchy: **Financial Group** -> **Cost Classification** -> **Line Item**. This structure applies across both BU and SU departments (though SU excludes Revenues and COS).

**1. REVENUS (BU Only):**
*   **Line Items:** Sales Rev-Hardwares, Sales Rev-Softwares, Sales Rev-Cards, Sales Rev-Services Support & Maintenance, CORPORATE Rev, Sales Rev-Merchants FlexPaie, Sales Rev-Prepaid Card, Sales Rev-Money Transfer, Sales Rev-Digital Platforms, Sales Rev-Bulk FlexRoll, VISA FUNDING, Sales Revenue -Hardwares IT, Sales Rev-Softwares licence IT, Sales Revenu - Support & Maintenance IT, Sales Revenue -Consulting/Training/Impl., Rev-ID, Cloud services, Miscellaneous Revenue, Sales Discounts.

**2. COS (Cost of Sales) (BU Only):**
*   **Line Items:** Purchases-hardware for resale, Purchases-software for resale, Purchases- cards / Cartes platiques, COS Maintenance et Support, COG Spares & Accessories, COS-Services (Merchants, Prepaid, Money Transfer, Bulk FlexRoll), Cost services-Cloud services / Digital Platforms, VISA VIK & EXPENSES, COS - SERVICE CLOUD, Other Direct cost.

**3. FIXED COSTS (OPEX):**
*   **ADMIN & FINANCES:** Payrolls expenses, Medical Expenses, Insurances expenses, Rent Expenses, Office Supplies, Janitorial expenses, Corporate Fees - Fixes Opex.
*   **TECHNICAL & OPERATIONS:** Computer, Telephone and internet expenses, Permits&Licences&Subscriptions, Annual Support Card.
*   **MARKETING & SALES:** Payrolls expenses.

**4. VARIABLES COSTS (OPEX):**
*   **ADMIN & FINANCES:** Transport Costs, Meals & Entertainment, Business Travel, Automobile expenses, Professional Fees, Depreciation Charges, Bank Charges-MM, Miscellaneous Loss, Charitable & Contribution, Miscellaneous Expenses, Management fees, Other Tax, Corporate Fees.
*   **TECHNICAL & OPERATIONS:** Small Tools, Repair and maintenance, Project expenses, Education & Training.
*   **MARKETING & SALES:** Marketing Costs / Promotion, Marketing Costs / Communication, Marketing Costs / Field Marketing.

**Derived Metrics (Calculated for Reporting vs Budget):**
*   *Gross Margin* = Total Revenus - Total COS
*   *Total OPEX* = Total Fixed Costs + Total Variables Costs
*   *EBIT* = Gross Margin - Total OPEX
*   *Total Costs* = Total COS + Total OPEX

---

## 4. Spend Request Lifecycle
The core workflow transitions a spend request from creation to final disbursement authorization.

1.  **Draft / Creation:** Encoder drafts a request, linking it to the required Master Data (Category), Department, Amount, and Vendor/Details.
2.  **Submission:** Request is submitted. Status -> `PENDING_BU_DIRECTOR` (or `PENDING_SU_DIRECTOR`).
3.  **Tier 1 Approval (Director):** The specific BU or SU Director reviews the business justification.
    *   *If Approved:* Status -> `PENDING_FPA`.
    *   *If Declined:* Status -> `DECLINED`. Notification sent to Encoder with comments.
4.  **Tier 2 Validation (FPA / HOD):** Validates the request against the allocated budget.
    *   *If Approved:* Status -> `PENDING_MD`.
    *   *If Declined:* Status -> `DECLINED`. Notification sent to Encoder.
5.  **Tier 3 Validation (MD):** Final executive review.
    *   *If Approved:* Status -> `APPROVED`. Funds are authorized for disbursement.
    *   *If Declined:* Status -> `DECLINED`.

---

## 5. Budget Dynamics (Allocation & Tracking)
A core function of the system is real-time budget tracking to ensure expenses do not exceed allocations.

1.  **Budget Allocation:** Admins (or FPA) upload/input the Forecasted Budget for the year/month. Budgets are allocated strictly down to the intersection of: `BU/SU Unit` -> `Department` -> `Expense Regroupment` (e.g., SU -> FPA -> Variable Costs/Admin -> Transport).
2.  **Tracking (Execution):** Every approved (and potentially pending) spend request deducts from or is tracked against this specific budget intersection.
3.  **Visibility & Control:** 
    *   FPA and MD can see the real-time consumption of the budget during the approval lifecycle.
    *   *Optional constraint:* The system could flag or hard-block requests that exceed the allocated budget, requiring a formal budget reallocation before approval.
4.  **Reporting:** Drive the Dashboards (Execution vs Forecast) directly from these dynamic tracking links.

---

## 6. Notifications
*   **System/Email Alerts:** Automatically triggered on status changes.
*   *Critical Trigger:* When a request transitions to `DECLINED`, an immediate notification is sent to the Encoder outlining the rejection comments so they can adjust and resubmit as a new request.

---

## 7. Reporting & Dashboards
The dashboard will replicate the Excel tracking views automatically, pulling from the real-time "Execution" data against the "Forecast".

**Key Visualizations:**
*   **Yearly & Monthly Budget Performance:** % of execution vs. forecast per major grouping (Revenue, COS, Fixed, Variable).
*   **Cost Analysis:** Bar charts comparing Execution vs Forecast for COS, Fixed, Variable, and Total OPEX.
*   **Cost Breakdown:** Granular views of spending by BU vs. SU.
*   **Execution Level:** Progress bars showing how close the current spend/revenue is to the forecasted budget (e.g., EBIT at 248%, Total OPEX at 19%).

---

## 8. Technical Architecture (DB-First, scaffolded N-Tier & React)
The project will be built using a modern, containerized stack optimized for extreme speed and strict modularity. It will adopt the N-Tier structural pattern proven in the `MyHomeClubV2` repository.

*   **Backend Generation (Apstory-Scaffold):** We will use a **Database-First** approach. Once the SQL schema is created, we will use the `apstory-scaffold` .NET tool to auto-generate the Dapper Data Access Layer (DAL), Domain, Service, and API Controller layers directly from the SQL Server database. This entirely mitigates boilerplate while retaining Dapper's raw SQL performance.
*   **Frontend API Generation (`apstory-api-gen`):** TypeScript API clients will be auto-generated by pulling from the backend Swagger docs using the `Apstory.TypescriptCodeGen.Swagger` tool.
*   **Frontend (React/Next.js):** The frontend will strictly use React. This is an active choice to maximize the speed advantage of using AI UI generators (like Vercel's v0 or Lovable), which are heavily biased toward generating and operating perfectly with React + Tailwind (whereas translating AI code into Angular negates the time saved).
*   **Database:** Microsoft SQL Server.
*   **Deployment:** Docker Compose setup with 2 primary containers for MVP:
    *   **Container 1:** Application (ASP.NET API + React Front End).
    *   **Container 2:** SQL Server Database (Persistent volume mapped to separate state).

---

## 9. Core Application Features
To ensure the MVP meets business needs without over-engineering:

1.  **Multi-Currency Support:**
    *   System must handle both USD ($) and Congolese Franc (FC).
    *   A configurable exchange rate (e.g., 1 USD = 2200 FC) will be managed by the system administrator and applied to calculations.
2.  **File Attachments (Receipts/Invoices):**
    *   The database logic and API will support attaching files to spend requests.
    *   For the MVP, we will build the schema to store file URLs/metadata. The specific blob storage provider (local vs S3 vs Azure) will be finalized during implementation.
3.  **Authentication & Security:**
    *   Simple Email/Password authentication.
    *   No complex SSO integration for the MVP. Passwords will be securely hashed, and JWTs (JSON Web Tokens) or secure session cookies will be used for API access.

---

## 10. Data Scoping & Visibility (The "Scope")
Unlike multi-tenant applications that isolate completely unrelated organizations (e.g., `ClubId` in MyHomeClub), InfoFin is a **Single-Tenant, Hierarchically-Scoped** application.

Data isolation is driven by the intersection of the User's **`Role`** and their **`Department`** (or `DepartmentGroup`). When a user logs in, the API reads their JWT claims and enforces data filtering at the SQL query level:

| User Role | Scope Boundary | Visibility / Capability |
| :--- | :--- | :--- |
| **Encodeur** | `DepartmentId` | Can only view and create Spend Requests for their specific Department. Can only view budget consumption for their own Department. |
| **Directeur (BU/SU)** | `DepartmentId` (or `DepartmentGroup`) | Can view all Spend Requests and Budgets generated within the departments they oversee. Cannot see data from unrelated BUs/SUs. |
| **FPA / Fin. Controller** | **Global Scope** | Absolute visibility. Can view requests from *all* BUs and SUs, compare actuals vs budgets system-wide, and execute Tier-2 approvals. |
| **Val MD (Managing Dir)** | **Global Scope** | Absolute visibility for final approvals and executive dashboarding. |
| **Administrateur** | **System Scope** | Can manage Master Data (Categories, Users, Roles). Does not typically participate in the financial approval workflow directly. |