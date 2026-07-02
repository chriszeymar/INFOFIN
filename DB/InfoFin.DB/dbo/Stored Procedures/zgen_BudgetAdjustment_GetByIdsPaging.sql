/****** Object:  StoredProcedure [dbo].[zgen_BudgetAdjustment_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging BudgetAdjustment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BudgetAdjustment_GetByIdsPaging]
  (@BudgetId INT=NULL,@AdjustedByUserId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_BudgetAdjustment AS (
    SELECT * FROM [dbo].[BudgetAdjustment] WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[BudgetAdjustment]
      WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
    )
    SELECT TotalRows, [dbo].[BudgetAdjustment].* FROM [dbo].[BudgetAdjustment], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_BudgetAdjustment WHERE CTE_BudgetAdjustment.Id = [dbo].[BudgetAdjustment].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_BudgetAdjustment AS (
    SELECT * FROM [dbo].[BudgetAdjustment] WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[BudgetAdjustment]
      WHERE (@BudgetId IS NULL OR [BudgetId] = @BudgetId) AND (@AdjustedByUserId IS NULL OR [AdjustedByUserId] = @AdjustedByUserId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[BudgetAdjustment].* FROM [dbo].[BudgetAdjustment], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_BudgetAdjustment WHERE CTE_BudgetAdjustment.Id = [dbo].[BudgetAdjustment].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
