CREATE TABLE [dbo].[Department] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [Name]              NVARCHAR (100) NOT NULL,
    [DepartmentGroupId] INT            NOT NULL,
    [IsActive]          BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]          DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]          DATETIME       DEFAULT (getdate()) NOT NULL,
    [OdooCompanyId]     INT            NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Department_DepartmentGroup] FOREIGN KEY ([DepartmentGroupId]) REFERENCES [dbo].[DepartmentGroup] ([Id]),
    UNIQUE NONCLUSTERED ([Name] ASC)
);

