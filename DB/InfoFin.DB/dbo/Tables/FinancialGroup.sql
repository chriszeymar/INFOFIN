CREATE TABLE [dbo].[FinancialGroup] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_FinancialGroup] PRIMARY KEY CLUSTERED ([Id] ASC)
);

