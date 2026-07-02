CREATE TABLE [dbo].[DepartmentGroup] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [BucketTypeId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_DepartmentGroup_BucketType] FOREIGN KEY ([BucketTypeId]) REFERENCES [dbo].[BucketType]([Id]),
    CONSTRAINT [PK_DepartmentGroup] PRIMARY KEY CLUSTERED ([Id] ASC)
);

