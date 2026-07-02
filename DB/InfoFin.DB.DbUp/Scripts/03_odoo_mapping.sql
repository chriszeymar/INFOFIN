-- =============================================
-- Script: Odoo Account Mapping
-- Purpose: Map Odoo chart of accounts to InfoFin financial categories
-- =============================================

CREATE TABLE [dbo].[OdooAccountMapping] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [OdooAccountCode] NVARCHAR(20) NOT NULL,
    [OdooAccountName] NVARCHAR(200) NOT NULL,
    [InfoFinCategoryId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_OdooAccountMapping_Category] FOREIGN KEY ([InfoFinCategoryId]) REFERENCES [dbo].[Category]([Id])
);
