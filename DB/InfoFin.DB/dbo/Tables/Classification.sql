CREATE TABLE [dbo].[Classification] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Classification] PRIMARY KEY CLUSTERED ([Id] ASC)
);

