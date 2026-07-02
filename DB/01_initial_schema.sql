-- =============================================
-- Script: Create InfoFin Schema
-- Purpose: Support Dapper & apstory-scaffold code generation
-- =============================================

CREATE TABLE [dbo].[Role] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1
);

CREATE TABLE [dbo].[BucketType] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE, -- 'BU' or 'SU'
    [IsActive] BIT NOT NULL DEFAULT 1
);

-- ADDED: DepartmentGroup to fix aggregate reporting (e.g. Total Banking)
CREATE TABLE [dbo].[DepartmentGroup] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [BucketTypeId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_DepartmentGroup_BucketType] FOREIGN KEY ([BucketTypeId]) REFERENCES [dbo].[BucketType]([Id])
);

CREATE TABLE [dbo].[Department] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE, 
    [DepartmentGroupId] INT NOT NULL, -- CHANGED: Pointers to DepartmentGroup instead of BucketType
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_Department_DepartmentGroup] FOREIGN KEY ([DepartmentGroupId]) REFERENCES [dbo].[DepartmentGroup]([Id])
);

CREATE TABLE [dbo].[User] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Email] NVARCHAR(100) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(MAX) NOT NULL,
    [RoleId] INT NOT NULL,
    [DepartmentId] INT NULL, -- ADDED: Link User to Department for routing
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_User_Role] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Role]([Id]),
    CONSTRAINT [FK_User_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id])
);

CREATE TABLE [dbo].[FinancialGroup] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1
);

CREATE TABLE [dbo].[Classification] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1
);

CREATE TABLE [dbo].[Category] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [FinancialGroupId] INT NOT NULL,
    [ClassificationId] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_Category_FinancialGroup] FOREIGN KEY ([FinancialGroupId]) REFERENCES [dbo].[FinancialGroup]([Id]),
    CONSTRAINT [FK_Category_Classification] FOREIGN KEY ([ClassificationId]) REFERENCES [dbo].[Classification]([Id])
);

CREATE TABLE [dbo].[Currency] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Code] NVARCHAR(10) NOT NULL UNIQUE, 
    [ExchangeRateToUSD] DECIMAL(18,6) NOT NULL,
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE()
);

-- ADDED: Vendor master table for reporting integrity
CREATE TABLE [dbo].[Vendor] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE [dbo].[Budget] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [DepartmentId] INT NOT NULL,
    [CategoryId] INT NOT NULL,
    [Year] INT NOT NULL,
    [Month] INT NULL, 
    [ForecastAmount] DECIMAL(18,2) NOT NULL,
    [CurrencyId] INT NOT NULL, -- Was already here in my design, Sonnet missed it, but keeping it
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_Budget_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [FK_Budget_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category]([Id]),
    CONSTRAINT [FK_Budget_Currency] FOREIGN KEY ([CurrencyId]) REFERENCES [dbo].[Currency]([Id]),
    CONSTRAINT [UQ_Budget_Department_Category_Date] UNIQUE([DepartmentId], [CategoryId], [Year], [Month])
);

-- ADDED: BudgetAdjustment audit trail
CREATE TABLE [dbo].[BudgetAdjustment] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [BudgetId] INT NOT NULL,
    [OldAmount] DECIMAL(18,2) NOT NULL,
    [NewAmount] DECIMAL(18,2) NOT NULL,
    [AdjustedByUserId] INT NOT NULL,
    [Reason] NVARCHAR(MAX) NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_BudgetAdjustment_Budget] FOREIGN KEY ([BudgetId]) REFERENCES [dbo].[Budget]([Id]),
    CONSTRAINT [FK_BudgetAdjustment_User] FOREIGN KEY ([AdjustedByUserId]) REFERENCES [dbo].[User]([Id])
);

CREATE TABLE [dbo].[SpendRequest] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ReferenceNumber] NVARCHAR(50) NOT NULL UNIQUE,
    [DepartmentId] INT NOT NULL,
    [CategoryId] INT NOT NULL,
    [EncoderId] INT NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [CurrencyId] INT NOT NULL,
    [LockedExchangeRate] DECIMAL(18,6) NOT NULL, -- ADDED: Point-in-time exchange rate
    [VendorId] INT NULL, -- CHANGED: Pointers to Vendor table
    [Description] NVARCHAR(MAX) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_SpendRequest_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [FK_SpendRequest_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category]([Id]),
    CONSTRAINT [FK_SpendRequest_Encoder] FOREIGN KEY ([EncoderId]) REFERENCES [dbo].[User]([Id]),
    CONSTRAINT [FK_SpendRequest_Currency] FOREIGN KEY ([CurrencyId]) REFERENCES [dbo].[Currency]([Id]),
    CONSTRAINT [FK_SpendRequest_Vendor] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendor]([Id])
);

-- ADDED: Multiple file attachment support
CREATE TABLE [dbo].[SpendRequestAttachment] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [SpendRequestId] INT NOT NULL,
    [FileUrl] NVARCHAR(MAX) NOT NULL,
    [FileName] NVARCHAR(255) NOT NULL,
    [UploadedByUserId] INT NOT NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_SpendRequestAttachment_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest]([Id]),
    CONSTRAINT [FK_SpendRequestAttachment_User] FOREIGN KEY ([UploadedByUserId]) REFERENCES [dbo].[User]([Id])
);

CREATE TABLE [dbo].[SpendRequestHistory] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [SpendRequestId] INT NOT NULL,
    [ActionById] INT NOT NULL,
    [OldStatus] NVARCHAR(50) NOT NULL,
    [NewStatus] NVARCHAR(50) NOT NULL,
    [Comments] NVARCHAR(MAX) NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_SpendRequestHistory_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest]([Id]),
    CONSTRAINT [FK_SpendRequestHistory_ActionBy] FOREIGN KEY ([ActionById]) REFERENCES [dbo].[User]([Id])
);

-- ADDED: Notification Log
CREATE TABLE [dbo].[NotificationLog] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [SpendRequestId] INT NOT NULL,
    [RecipientUserId] INT NOT NULL,
    [TriggerStatus] NVARCHAR(50) NOT NULL,
    [IsSuccessful] BIT NOT NULL DEFAULT 0,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_NotificationLog_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest]([Id]),
    CONSTRAINT [FK_NotificationLog_Recipient] FOREIGN KEY ([RecipientUserId]) REFERENCES [dbo].[User]([Id])
);
