CREATE TABLE [dbo].[Account] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (200) NOT NULL,
    [FinancialGroupId] INT            NOT NULL,
    [ClassificationId] INT            NULL,
    [OdooAccountId]    INT            NULL,
    [OdooAccountCode]  NVARCHAR (20)  NULL,
    [OdooAccountType]  NVARCHAR (50)  NULL,
    [IsActive]         BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Account_FinancialGroup] FOREIGN KEY ([FinancialGroupId]) REFERENCES [dbo].[FinancialGroup] ([Id]),
    CONSTRAINT [FK_Account_Classification] FOREIGN KEY ([ClassificationId]) REFERENCES [dbo].[Classification] ([Id])
);
