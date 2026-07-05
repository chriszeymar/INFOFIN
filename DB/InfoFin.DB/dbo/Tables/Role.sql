CREATE TABLE [dbo].[Role] (
    [Id]       INT           IDENTITY (1, 1) NOT NULL,
    [Name]     NVARCHAR (50) NOT NULL,
    [IsActive] BIT           DEFAULT ((1)) NOT NULL,
    [CreateDT] DATETIME      DEFAULT (getdate()) NOT NULL,
    [UpdateDT] DATETIME      DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([Name] ASC)
);

