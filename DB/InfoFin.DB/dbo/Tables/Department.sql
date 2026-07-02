CREATE TABLE [dbo].[Department] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [DepartmentGroupId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_Department_DepartmentGroup] FOREIGN KEY ([DepartmentGroupId]) REFERENCES [dbo].[DepartmentGroup]([Id]),
    CONSTRAINT [PK_Department] PRIMARY KEY CLUSTERED ([Id] ASC)
);

