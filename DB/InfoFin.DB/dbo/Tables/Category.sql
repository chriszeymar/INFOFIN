CREATE TABLE [dbo].[Category] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (200) NOT NULL,
    [FinancialGroupId] INT            NOT NULL,
    [ClassificationId] INT            NULL,
    [IsActive]         BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [OdooAccountId]    INT            NULL,
    [OdooAccountCode]  NVARCHAR (100) NULL,
    [OdooAccountType]  NVARCHAR (50)  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Category_Classification] FOREIGN KEY ([ClassificationId]) REFERENCES [dbo].[Classification] ([Id]),
    CONSTRAINT [FK_Category_FinancialGroup] FOREIGN KEY ([FinancialGroupId]) REFERENCES [dbo].[FinancialGroup] ([Id])
);

