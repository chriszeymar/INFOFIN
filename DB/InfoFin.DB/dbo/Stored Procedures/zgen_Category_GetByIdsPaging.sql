/****** Object:  StoredProcedure [dbo].[zgen_Category_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging Category
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Category_GetByIdsPaging]
  (@FinancialGroupId INT=NULL,@ClassificationId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_Category AS (
    SELECT * FROM [dbo].[Category] WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Category]
      WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
    )
    SELECT TotalRows, [dbo].[Category].* FROM [dbo].[Category], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Category WHERE CTE_Category.Id = [dbo].[Category].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_Category AS (
    SELECT * FROM [dbo].[Category] WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Category]
      WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[Category].* FROM [dbo].[Category], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Category WHERE CTE_Category.Id = [dbo].[Category].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
