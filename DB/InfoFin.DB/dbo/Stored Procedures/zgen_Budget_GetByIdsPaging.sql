/****** Object:  StoredProcedure [dbo].[zgen_Budget_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging Budget
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Budget_GetByIdsPaging]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@CurrencyId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_Budget AS (
    SELECT * FROM [dbo].[Budget] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Budget]
      WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
    )
    SELECT TotalRows, [dbo].[Budget].* FROM [dbo].[Budget], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Budget WHERE CTE_Budget.Id = [dbo].[Budget].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_Budget AS (
    SELECT * FROM [dbo].[Budget] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Budget]
      WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[Budget].* FROM [dbo].[Budget], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Budget WHERE CTE_Budget.Id = [dbo].[Budget].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
