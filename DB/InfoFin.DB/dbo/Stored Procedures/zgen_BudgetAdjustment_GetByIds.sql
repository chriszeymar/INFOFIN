/****** Object:  StoredProcedure [dbo].[zgen_BudgetAdjustment_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids BudgetAdjustment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BudgetAdjustment_GetByIds]
  (@BudgetId INT=NULL,@AdjustedByUserId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[BudgetAdjustment] WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[BudgetAdjustment] WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
