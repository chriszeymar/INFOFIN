CREATE TABLE [dbo].[SpendRequestHistory] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [SpendRequestId] INT            NOT NULL,
    [ActionById]     INT            NOT NULL,
    [OldStatus]      NVARCHAR (50)  NOT NULL,
    [NewStatus]      NVARCHAR (50)  NOT NULL,
    [Comments]       NVARCHAR (MAX) NULL,
    [CreateDT]       DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]       DATETIME       DEFAULT (getdate()) NOT NULL,
    [IsActive]       BIT            DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SpendRequestHistory_ActionBy] FOREIGN KEY ([ActionById]) REFERENCES [dbo].[User] ([Id]),
    CONSTRAINT [FK_SpendRequestHistory_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest] ([Id])
);

