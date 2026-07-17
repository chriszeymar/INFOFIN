CREATE TABLE [dbo].[OdooAccountMapping] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [OdooAccountCode]   NVARCHAR (20)  NOT NULL,
    [OdooAccountName]   NVARCHAR (200) NOT NULL,
    [InfoFinAccountId] INT            NOT NULL,
    [IsActive]          BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]          DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]          DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

ALTER TABLE [dbo].[OdooAccountMapping]
    ADD CONSTRAINT [FK_OdooAccountMapping_Account] FOREIGN KEY ([InfoFinAccountId]) REFERENCES [dbo].[Account] ([Id]);
