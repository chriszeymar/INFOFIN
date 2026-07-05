CREATE TABLE [dbo].[SpendRequestAttachment] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [SpendRequestId]   INT            NOT NULL,
    [FileUrl]          NVARCHAR (MAX) NOT NULL,
    [FileName]         NVARCHAR (255) NOT NULL,
    [UploadedByUserId] INT            NOT NULL,
    [CreateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]         DATETIME       DEFAULT (getdate()) NOT NULL,
    [IsActive]         BIT            DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SpendRequestAttachment_Request] FOREIGN KEY ([SpendRequestId]) REFERENCES [dbo].[SpendRequest] ([Id]),
    CONSTRAINT [FK_SpendRequestAttachment_User] FOREIGN KEY ([UploadedByUserId]) REFERENCES [dbo].[User] ([Id])
);

