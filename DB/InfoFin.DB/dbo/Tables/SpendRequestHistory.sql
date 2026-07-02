CREATE TABLE [dbo].[SpendRequestHistory] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [SpendRequestId] INT NOT NULL,
    [ActionById] INT NOT NULL,
    [OldStatus] NVARCHAR(50) NOT NULL,
    [NewStatus] NVARCHAR(50) NOT NULL,
    [Comments] NVARCHAR(MAX) NULL,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_SpendRequestHistory_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest]([Id]),
    CONSTRAINT [FK_SpendRequestHistory_ActionBy] FOREIGN KEY ([ActionById]) REFERENCES [dbo].[User]([Id]),
    CONSTRAINT [PK_SpendRequestHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
);

