/****** Object:  StoredProcedure [dbo].[zgen_BudgetAdjustment_GetById] ******/
-- ===================================================================
-- Description    : Select By Id BudgetAdjustment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BudgetAdjustment_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[BudgetAdjustment] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[BudgetAdjustment] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[BudgetAdjustment] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[BudgetAdjustment] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END