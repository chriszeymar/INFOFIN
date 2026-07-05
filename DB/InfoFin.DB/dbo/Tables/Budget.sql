CREATE TABLE [dbo].[Budget] (
    [Id]             INT             IDENTITY (1, 1) NOT NULL,
    [DepartmentId]   INT             NOT NULL,
    [CategoryId]     INT             NOT NULL,
    [Year]           INT             NOT NULL,
    [Month]          INT             NULL,
    [ForecastAmount] DECIMAL (18, 2) NOT NULL,
    [CurrencyId]     INT             NOT NULL,
    [CreateDT]       DATETIME        DEFAULT (getdate()) NOT NULL,
    [UpdateDT]       DATETIME        DEFAULT (getdate()) NOT NULL,
    [IsActive]       BIT             DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Budget_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category] ([Id]),
    CONSTRAINT [FK_Budget_Currency] FOREIGN KEY ([CurrencyId]) REFERENCES [dbo].[Currency] ([Id]),
    CONSTRAINT [FK_Budget_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department] ([Id]),
    CONSTRAINT [UQ_Budget_Department_Category_Date] UNIQUE NONCLUSTERED ([DepartmentId] ASC, [CategoryId] ASC, [Year] ASC, [Month] ASC)
);


GO
ALTER TABLE [dbo].[Budget]
    ADD CONSTRAINT [UQ_Budget_Department_Category_Date] UNIQUE NONCLUSTERED ([DepartmentId] ASC, [CategoryId] ASC, [Year] ASC, [Month] ASC);
GO

