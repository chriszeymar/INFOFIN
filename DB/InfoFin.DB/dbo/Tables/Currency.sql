CREATE TABLE [dbo].[Currency] (
    [Id]                INT             IDENTITY (1, 1) NOT NULL,
    [Code]              NVARCHAR (10)   NOT NULL,
    [ExchangeRateToUSD] DECIMAL (18, 6) NOT NULL,
    [UpdateDT]          DATETIME        DEFAULT (getdate()) NOT NULL,
    [CreateDT]          DATETIME        DEFAULT (getdate()) NOT NULL,
    [IsActive]          BIT             DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([Code] ASC)
);

