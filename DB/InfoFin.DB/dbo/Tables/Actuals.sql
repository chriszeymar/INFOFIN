CREATE TABLE [dbo].[Actuals] (
    [Id]           INT             IDENTITY (1, 1) NOT NULL,
    [DepartmentId] INT             NOT NULL,
    [CategoryId]   INT             NOT NULL,
    [Year]         INT             NOT NULL,
    [Month]        INT             NULL,
    [Amount]       DECIMAL (18, 2) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

ALTER TABLE [dbo].[Actuals]
    ADD CONSTRAINT [UQ_Actuals_DeptCatPeriod] UNIQUE NONCLUSTERED ([DepartmentId] ASC, [CategoryId] ASC, [Year] ASC, [Month] ASC);
GO

ALTER TABLE [dbo].[Actuals]
    ADD CONSTRAINT [FK_Actuals_Category] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category] ([Id]);
GO

ALTER TABLE [dbo].[Actuals]
    ADD CONSTRAINT [FK_Actuals_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department] ([Id]);
GO

