-- ============================================================
-- Odoo Sync Validation Script
-- Run against InfoFinDb to verify Phase 10 integration
-- ============================================================

PRINT '═══════════════════════════════════════════'
PRINT '     ODOO SYNC VALIDATION REPORT'
PRINT '═══════════════════════════════════════════'
PRINT ''

-- 1. COMPANIES → DEPARTMENTS
PRINT '── 1. Companies → Departments ──'
SELECT 'Departments with Odoo ID' AS [Check], COUNT(*) AS [Count] FROM Department WHERE OdooCompanyId IS NOT NULL
UNION ALL
SELECT 'Departments WITHOUT Odoo ID', COUNT(*) FROM Department WHERE OdooCompanyId IS NULL AND IsActive = 1
UNION ALL
SELECT 'Total active departments', COUNT(*) FROM Department WHERE IsActive = 1

SELECT d.Id, d.Name, d.OdooCompanyId, dg.Name AS DepartmentGroup, bt.Name AS BucketType
FROM Department d
JOIN DepartmentGroup dg ON dg.Id = d.DepartmentGroupId
JOIN BucketType bt ON bt.Id = dg.BucketTypeId
WHERE d.OdooCompanyId IS NOT NULL
ORDER BY d.OdooCompanyId

PRINT ''

-- 2. ACCOUNTS → CATEGORIES
PRINT '── 2. Accounts → Categories ──'
SELECT 'Categories with Odoo ID' AS [Check], COUNT(*) AS [Count] FROM Category WHERE OdooAccountId IS NOT NULL
UNION ALL
SELECT 'Categories WITHOUT Odoo ID', COUNT(*) FROM Category WHERE OdooAccountId IS NULL AND IsActive = 1

-- Breakdown by FinancialGroup
SELECT fg.Name AS FinancialGroup, COUNT(*) AS Categories
FROM Category c
JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
WHERE c.OdooAccountId IS NOT NULL
GROUP BY fg.Name
ORDER BY fg.Name

PRINT ''

-- 3. JOURNAL LINES
PRINT '── 3. Journal Lines ──'
SELECT 'Total journal lines' AS [Check], COUNT(*) AS [Count] FROM OdooJournalLine
UNION ALL
SELECT 'Distinct companies', COUNT(DISTINCT OdooCompanyId) FROM OdooJournalLine
UNION ALL
SELECT 'Distinct accounts', COUNT(DISTINCT OdooAccountId) FROM OdooJournalLine

-- Year/Month distribution
SELECT Year, COUNT(*) AS Lines, 
       SUM(Debit) AS TotalDebit, SUM(Credit) AS TotalCredit, 
       SUM(NetAmount) AS NetTotal
FROM OdooJournalLine
GROUP BY Year
ORDER BY Year

-- Date range
SELECT MIN(Date) AS EarliestDate, MAX(Date) AS LatestDate, DATEDIFF(DAY, MIN(Date), MAX(Date)) AS DaySpan
FROM OdooJournalLine

PRINT ''

-- 4. ACTUALS
PRINT '── 4. Actuals ──'
SELECT 'Total Actuals rows' AS [Check], CAST(COUNT(*) AS VARCHAR) AS [Count] FROM Actuals
UNION ALL
SELECT 'Distinct departments', CAST(COUNT(DISTINCT DepartmentId) AS VARCHAR) FROM Actuals
UNION ALL
SELECT 'Distinct categories', CAST(COUNT(DISTINCT CategoryId) AS VARCHAR) FROM Actuals
UNION ALL
SELECT 'Total amount (all)', FORMAT(SUM(Amount), 'N0') FROM Actuals

-- Actuals by FinancialGroup
SELECT fg.Name AS FinancialGroup, COUNT(*) AS Rows, SUM(a.Amount) AS TotalAmount
FROM Actuals a
JOIN Category c ON c.Id = a.CategoryId
JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
GROUP BY fg.Name
ORDER BY fg.Name

-- Actuals by Department
SELECT d.Name AS Department, COUNT(*) AS Rows, SUM(a.Amount) AS TotalAmount
FROM Actuals a
JOIN Department d ON d.Id = a.DepartmentId
GROUP BY d.Name
ORDER BY d.Name

PRINT ''

-- 5. INTEGRITY CHECKS
PRINT '── 5. Integrity Checks ──'

-- Orphaned Actuals (category missing Odoo ID)
SELECT 'Actuals with non-Odoo category' AS [Warning], COUNT(*) AS [Count]
FROM Actuals a
JOIN Category c ON c.Id = a.CategoryId
WHERE c.OdooAccountId IS NULL

-- Orphaned Actuals (department missing Odoo ID)
SELECT 'Actuals with non-Odoo department' AS [Warning], COUNT(*) AS [Count]
FROM Actuals a
JOIN Department d ON d.Id = a.DepartmentId
WHERE d.OdooCompanyId IS NULL

-- Journal lines that couldn't map to Actuals (missing mirror)
SELECT 'Unmapped journal lines' AS [Warning], COUNT(*) AS [Count]
FROM OdooJournalLine jl
LEFT JOIN Department d ON d.OdooCompanyId = jl.OdooCompanyId
LEFT JOIN Category c ON c.OdooAccountId = jl.OdooAccountId
WHERE d.Id IS NULL OR c.Id IS NULL

-- Duplicate OdooLineId
SELECT 'Duplicate OdooLineIds' AS [Warning], COUNT(*) AS [Count]
FROM (
    SELECT OdooLineId, COUNT(*) AS cnt
    FROM OdooJournalLine
    GROUP BY OdooLineId
    HAVING COUNT(*) > 1
) dupes

-- Categories with Odoo ID but wrong FinancialGroup (should not exist but worth checking)
SELECT 'P&L categories in wrong group' AS [Warning], COUNT(*) AS [Count]
FROM Category c
JOIN FinancialGroup fg ON fg.Id = c.FinancialGroupId
WHERE c.OdooAccountId IS NOT NULL
  AND NOT (
    (c.OdooAccountType IN ('income','income_other') AND fg.Name = 'Revenus')
    OR (c.OdooAccountType = 'expense_direct_cost' AND fg.Name = 'COS')
    OR (c.OdooAccountType = 'expense' AND fg.Name IN ('Fixed Costs','Variables Costs'))
  )

PRINT ''
PRINT '═══════════════════════════════════════════'
PRINT '     VALIDATION COMPLETE'
PRINT '═══════════════════════════════════════════'
