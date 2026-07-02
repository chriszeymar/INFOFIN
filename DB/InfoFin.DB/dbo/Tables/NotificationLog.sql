CREATE TABLE [dbo].[NotificationLog] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [SpendRequestId] INT NOT NULL,
    [RecipientUserId] INT NOT NULL,
    [TriggerStatus] NVARCHAR(50) NOT NULL,
    [IsSuccessful] BIT NOT NULL DEFAULT 0,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_NotificationLog_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest]([Id]),
    CONSTRAINT [FK_NotificationLog_Recipient] FOREIGN KEY ([RecipientUserId]) REFERENCES [dbo].[User]([Id]),
    CONSTRAINT [PK_NotificationLog] PRIMARY KEY CLUSTERED ([Id] ASC)
);

