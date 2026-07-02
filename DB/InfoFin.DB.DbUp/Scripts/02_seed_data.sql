-- =============================================
-- Script: Apply Master Data Seed
-- Purpose: Populates the initial hierarchical data for Categories, Departments, and Currencies
-- =============================================

-- 1. Insert Base Roles
INSERT INTO [dbo].[Role] ([Name]) VALUES 
('Financial Analyst'),
('FPA Reviewer'),
('FPA Approver'),
('Administrateur');

-- 2. Insert Base Currencies
INSERT INTO [dbo].[Currency] ([Code], [ExchangeRateToUSD]) VALUES
('USD', 1.000000),
('FC', 2200.000000);

-- 3. Insert BucketTypes
INSERT INTO [dbo].[BucketType] ([Name]) VALUES 
('BU'), 
('SU');

-- Fetch BucketTypeIds
DECLARE @BuId INT = (SELECT Id FROM [dbo].[BucketType] WHERE Name = 'BU');
DECLARE @SuId INT = (SELECT Id FROM [dbo].[BucketType] WHERE Name = 'SU');

-- 4. Insert DepartmentGroups
INSERT INTO [dbo].[DepartmentGroup] ([Name], [BucketTypeId]) VALUES
('Banking & Digital', @BuId),
('IT & Cloud', @BuId),
('DG, Admin & Fin', @SuId);

DECLARE @BankingId INT = (SELECT Id FROM [dbo].[DepartmentGroup] WHERE Name = 'Banking & Digital');
DECLARE @ItCloudId INT = (SELECT Id FROM [dbo].[DepartmentGroup] WHERE Name = 'IT & Cloud');
DECLARE @AdminFinId INT = (SELECT Id FROM [dbo].[DepartmentGroup] WHERE Name = 'DG, Admin & Fin');

-- 5. Insert Departments
INSERT INTO [dbo].[Department] ([Name], [DepartmentGroupId]) VALUES
('CIRRUS - DIGITAL', @BankingId),
('INFOSET SARL - MONETIQUE', @BankingId),
('GENISYS - CLOUD', @ItCloudId),
('AGMUX', @ItCloudId),
('DG', @AdminFinId),
('FPA', @AdminFinId),
('ADMIN & ACCOUNTING', @AdminFinId);

-- 6. Insert FinancialGroups
INSERT INTO [dbo].[FinancialGroup] ([Name]) VALUES
('Revenus'),
('COS'),
('Fixed Costs'),
('Variables Costs');

DECLARE @RevId INT = (SELECT Id FROM [dbo].[FinancialGroup] WHERE Name = 'Revenus');
DECLARE @CosId INT = (SELECT Id FROM [dbo].[FinancialGroup] WHERE Name = 'COS');
DECLARE @FixId INT = (SELECT Id FROM [dbo].[FinancialGroup] WHERE Name = 'Fixed Costs');
DECLARE @VarId INT = (SELECT Id FROM [dbo].[FinancialGroup] WHERE Name = 'Variables Costs');

-- 7. Insert Classifications
INSERT INTO [dbo].[Classification] ([Name]) VALUES
('Admin & Finances'),
('Technical & Operations'),
('Marketing & Sales');

DECLARE @AdminClassId INT = (SELECT Id FROM [dbo].[Classification] WHERE Name = 'Admin & Finances');
DECLARE @TechClassId INT = (SELECT Id FROM [dbo].[Classification] WHERE Name = 'Technical & Operations');
DECLARE @MarkClassId INT = (SELECT Id FROM [dbo].[Classification] WHERE Name = 'Marketing & Sales');

-- 8. Insert Categories - Revenues
INSERT INTO [dbo].[Category] ([Name], [FinancialGroupId], [ClassificationId]) VALUES
('Sales Rev-Hardwares', @RevId, NULL),
('Sales Rev-Softwares', @RevId, NULL),
('Sales Rev-Cards', @RevId, NULL),
('Sales Rev-Services Support & Maintenance', @RevId, NULL),
('CORPORATE Rev', @RevId, NULL),
('Sales Rev-Merchants FlexPaie', @RevId, NULL),
('Sales Rev-Prepaid Card', @RevId, NULL),
('Sales Rev-Money Transfer', @RevId, NULL),
('Sales Rev-Digital Platforms', @RevId, NULL),
('Sales Rev-Bulk FlexRoll', @RevId, NULL),
('VISA FUNDING', @RevId, NULL),
('Sales Revenue -Hardwares IT', @RevId, NULL),
('Sales Rev-Softwares licence IT', @RevId, NULL),
('Sales Revenu - Support & Maintenance IT', @RevId, NULL),
('Sales Revenue -Consulting/Training/Impl.', @RevId, NULL),
('Rev-ID', @RevId, NULL),
('Cloud services', @RevId, NULL),
('Miscellaneous Revenue', @RevId, NULL),
('Sales Discounts', @RevId, NULL);

-- 9. Insert Categories - COS
INSERT INTO [dbo].[Category] ([Name], [FinancialGroupId], [ClassificationId]) VALUES
('Purchases-hardware for resale', @CosId, NULL),
('Purchases-software for resale', @CosId, NULL),
('Purchases- cards / Cartes platiques', @CosId, NULL),
('COS Maintenance et Support', @CosId, NULL),
('COG Spares & Accessories', @CosId, NULL),
('COS-Services', @CosId, NULL),
('Cost services-Cloud services / Digital Platforms', @CosId, NULL),
('VISA VIK & EXPENSES', @CosId, NULL),
('COS - SERVICE CLOUD', @CosId, NULL),
('Other Direct cost', @CosId, NULL);

-- 10. Insert Categories - Fixed Costs
INSERT INTO [dbo].[Category] ([Name], [FinancialGroupId], [ClassificationId]) VALUES
('Payrolls expenses', @FixId, @AdminClassId),
('Medical Expenses', @FixId, @AdminClassId),
('Insurances expenses', @FixId, @AdminClassId),
('Rent Expenses', @FixId, @AdminClassId),
('Office Supplies', @FixId, @AdminClassId),
('Janitorial expenses', @FixId, @AdminClassId),
('Corporate Fees - Fixes Opex', @FixId, @AdminClassId),
('Computer, Telephone and internet expenses', @FixId, @TechClassId),
('Permits&Licences&Subscriptions', @FixId, @TechClassId),
('Annual Support Card', @FixId, @TechClassId),
('Payrolls expenses (Marketing)', @FixId, @MarkClassId);

-- 11. Insert Categories - Variable Costs
INSERT INTO [dbo].[Category] ([Name], [FinancialGroupId], [ClassificationId]) VALUES
('Transport Costs', @VarId, @AdminClassId),
('Meals & Entertainment', @VarId, @AdminClassId),
('Business Travel', @VarId, @AdminClassId),
('Automobile expenses', @VarId, @AdminClassId),
('Professional Fees', @VarId, @AdminClassId),
('Depreciation Charges', @VarId, @AdminClassId),
('Bank Charges-MM', @VarId, @AdminClassId),
('Miscellaneous Loss', @VarId, @AdminClassId),
('Charitable & Contribution', @VarId, @AdminClassId),
('Miscellaneous Expenses', @VarId, @AdminClassId),
('Management fees', @VarId, @AdminClassId),
('Other Tax', @VarId, @AdminClassId),
('Corporate Fees', @VarId, @AdminClassId),
('Small Tools', @VarId, @TechClassId),
('Repair and maintenance', @VarId, @TechClassId),
('Project expenses', @VarId, @TechClassId),
('Education & Training', @VarId, @TechClassId),
('Marketing Costs / Promotion', @VarId, @MarkClassId),
('Marketing Costs / Communication', @VarId, @MarkClassId),
('Marketing Costs / Field Marketing', @VarId, @MarkClassId);

-- 12. Bootstrap Users (plain-text passwords for initial login)
INSERT INTO [dbo].[User] ([Email], [PasswordHash], [RoleId], [DepartmentId], [IsActive])
VALUES
('admin@infoset.cd',                'admin', 4, NULL, 1),
('analyst.cirrus@infoset.cd',       'pass',  1, 1, 1),
('reviewer@infoset.cd',             'pass',  2, 6, 1),
('approver@infoset.cd',             'pass',  3, 6, 1);