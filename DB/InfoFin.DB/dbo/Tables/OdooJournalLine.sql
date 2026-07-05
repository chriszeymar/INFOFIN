CREATE TABLE [dbo].[OdooJournalLine] (
    [Id]              INT             IDENTITY (1, 1) NOT NULL,
    [OdooLineId]      INT             NOT NULL,
    [OdooCompanyId]   INT             NOT NULL,
    [OdooCompanyName] NVARCHAR (200)  NULL,
    [OdooAccountId]   INT             NOT NULL,
    [OdooAccountCode] NVARCHAR (100)  NULL,
    [OdooAccountName] NVARCHAR (200)  NULL,
    [Date]            DATE            NOT NULL,
    [Year]            AS              (datepart(year,[Date])),
    [Month]           AS              (datepart(month,[Date])),
    [Debit]           DECIMAL (18, 2) DEFAULT ((0)) NOT NULL,
    [Credit]          DECIMAL (18, 2) DEFAULT ((0)) NOT NULL,
    [NetAmount]       AS              ([Credit]-[Debit]),
    [State]           NVARCHAR (20)   NULL,
    [OdooWriteDate]   DATETIME        NULL,
    [ImportedAt]      DATETIME        DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_OdooJournalLine_OdooLineId]
    ON [dbo].[OdooJournalLine]([OdooLineId] ASC);
GO

