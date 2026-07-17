CREATE TABLE [dbo].[OdooSyncRun] (
    [RunId]       NVARCHAR (16)  NOT NULL,
    [StartedAt]   DATETIME       NOT NULL,
    [CompletedAt] DATETIME       NOT NULL,
    [DurationMs]  FLOAT          NOT NULL,
    [Year]        INT            NOT NULL,
    [ResultJson]  NVARCHAR (MAX) NOT NULL,
    PRIMARY KEY CLUSTERED ([RunId] ASC)
);
