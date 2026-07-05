CREATE TABLE [dbo].[User] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Email]        NVARCHAR (100) NOT NULL,
    [PasswordHash] NVARCHAR (MAX) NOT NULL,
    [RoleId]       INT            NOT NULL,
    [DepartmentId] INT            NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [CreateDT]     DATETIME       DEFAULT (getdate()) NOT NULL,
    [UpdateDT]     DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_User_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department] ([Id]),
    CONSTRAINT [FK_User_Role] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Role] ([Id]),
    UNIQUE NONCLUSTERED ([Email] ASC)
);

