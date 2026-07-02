CREATE TABLE [dbo].[User] (
 [Id] INT IDENTITY (1, 1) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NOT NULL,
    [RoleId] INT NOT NULL,
    [DepartmentId] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdateDT] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_User_Role] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Role]([Id]),
    CONSTRAINT [FK_User_Department] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Department]([Id]),
    CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED ([Id] ASC)
);

