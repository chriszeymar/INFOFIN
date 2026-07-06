/****** Object:  StoredProcedure [dbo].[zgen_Actuals_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging Actuals
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Actuals_GetByIdsPaging]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_Actuals AS (
    SELECT * FROM [dbo].[Actuals] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Actuals]
      WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
    )
    SELECT TotalRows, [dbo].[Actuals].* FROM [dbo].[Actuals], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Actuals WHERE CTE_Actuals.Id = [dbo].[Actuals].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_Actuals AS (
    SELECT * FROM [dbo].[Actuals] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Actuals]
      WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[Actuals].* FROM [dbo].[Actuals], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Actuals WHERE CTE_Actuals.Id = [dbo].[Actuals].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
