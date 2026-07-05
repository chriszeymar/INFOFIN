CREATE TABLE [dbo].[BudgetAdjustment] (
    [Id]               INT             IDENTITY (1, 1) NOT NULL,
    [BudgetId]         INT             NOT NULL,
    [OldAmount]        DECIMAL (18, 2) NOT NULL,
    [NewAmount]        DECIMAL (18, 2) NOT NULL,
    [AdjustedByUserId] INT             NOT NULL,
    [Reason]           NVARCHAR (MAX)  NULL,
    [CreateDT]         DATETIME        DEFAULT (getdate()) NOT NULL,
    [UpdateDT]         DATETIME        DEFAULT (getdate()) NOT NULL,
    [IsActive]         BIT             DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_BudgetAdjustment_Budget] FOREIGN KEY ([BudgetId]) REFERENCES [dbo].[Budget] ([Id]),
    CONSTRAINT [FK_BudgetAdjustment_User] FOREIGN KEY ([AdjustedByUserId]) REFERENCES [dbo].[User] ([Id])
);

