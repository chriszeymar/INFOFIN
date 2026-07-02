CREATE TABLE [dbo].[Budget] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [DepartmentId] INT NOT NULL,
    [CategoryId] INT NOT NULL,
    [Year] INT NOT NULL,
    [Month] INT NULL,
    [ForecastAmount] DECIMAL(18,2) NOT NULL,
    [CurrencyId] INT NOT NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_Budget_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [FK_Budget_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category]([Id]),
    CONSTRAINT [FK_Budget_Currency] FOREIGN KEY ([CurrencyId]) REFERENCES [dbo].[Currency]([Id]),
    CONSTRAINT [PK_Budget] PRIMARY KEY CLUSTERED ([Id] ASC)
);

