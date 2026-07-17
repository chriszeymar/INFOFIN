CREATE TABLE [dbo].[OdooDepartmentMapping] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [OdooAnalyticName]  NVARCHAR (200) NOT NULL,
    [DepartmentId]      INT            NOT NULL,
    [IsActive]          BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]          DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_OdooDeptMap_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department] ([Id]),
    CONSTRAINT [UQ_OdooDeptMap_Name] UNIQUE ([OdooAnalyticName])
);
