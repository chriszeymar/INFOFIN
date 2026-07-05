-- ============================================================
-- Script 05: Odoo Integration Tables
-- ============================================================

-- Layer 1: Raw journal entries
CREATE TABLE [dbo].[OdooJournalLine] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [OdooLineId] INT NOT NULL,
    [OdooCompanyId] INT NOT NULL,
    [OdooCompanyName] NVARCHAR(200) NULL,
    [OdooAccountId] INT NOT NULL,
    [OdooAccountCode] NVARCHAR(20) NULL,
    [OdooAccountName] NVARCHAR(200) NULL,
    [Date] DATE NOT NULL,
    [Year] AS YEAR([Date]),
    [Month] AS MONTH([Date]),
    [Debit] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [Credit] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [NetAmount] AS (Credit - Debit),
    [State] NVARCHAR(20) NULL,
    [OdooWriteDate] DATETIME NULL,
    [ImportedAt] DATETIME NOT NULL DEFAULT GETDATE()
);
CREATE UNIQUE INDEX [IX_OdooJournalLine_OdooLineId] ON [dbo].[OdooJournalLine]([OdooLineId]);

-- Layer: Actuals (Odoo-derived, read-only)
CREATE TABLE [dbo].[Actuals] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [DepartmentId] INT NOT NULL,
    [CategoryId] INT NOT NULL,
    [Year] INT NOT NULL,
    [Month] INT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [FK_Actuals_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [FK_Actuals_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category]([Id]),
    CONSTRAINT [UQ_Actuals_DeptCatPeriod] UNIQUE([DepartmentId], [CategoryId], [Year], [Month])
);

-- Layer 2: Mirror columns on existing tables
ALTER TABLE [dbo].[Department] ADD [OdooCompanyId] INT NULL;
ALTER TABLE [dbo].[Category] ADD
    [OdooAccountId] INT NULL,
    [OdooAccountCode] NVARCHAR(20) NULL,
    [OdooAccountType] NVARCHAR(50) NULL;
