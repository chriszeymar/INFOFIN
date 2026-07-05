CREATE TABLE [dbo].[DepartmentGroup] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Name]         NVARCHAR (100) NOT NULL,
    [BucketTypeId] INT            NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]     DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]     DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_DepartmentGroup_BucketType] FOREIGN KEY ([BucketTypeId]) REFERENCES [dbo].[BucketType] ([Id]),
    UNIQUE NONCLUSTERED ([Name] ASC)
);

