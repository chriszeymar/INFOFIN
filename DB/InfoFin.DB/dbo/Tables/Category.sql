CREATE TABLE [dbo].[Category] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [FinancialGroupId] INT NOT NULL,
    [ClassificationId] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_Category_FinancialGroup] FOREIGN KEY ([FinancialGroupId]) REFERENCES [dbo].[FinancialGroup]([Id]),
    CONSTRAINT [FK_Category_Classification] FOREIGN KEY ([ClassificationId]) REFERENCES [dbo].[Classification]([Id]),
    CONSTRAINT [PK_Category] PRIMARY KEY CLUSTERED ([Id] ASC)
);

