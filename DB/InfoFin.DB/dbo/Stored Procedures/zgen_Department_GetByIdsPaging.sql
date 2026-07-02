/****** Object:  StoredProcedure [dbo].[zgen_Department_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging Department
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Department_GetByIdsPaging]
  (@DepartmentGroupId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_Department AS (
    SELECT * FROM [dbo].[Department] WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Department]
      WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
    )
    SELECT TotalRows, [dbo].[Department].* FROM [dbo].[Department], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Department WHERE CTE_Department.Id = [dbo].[Department].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_Department AS (
    SELECT * FROM [dbo].[Department] WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[Department]
      WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[Department].* FROM [dbo].[Department], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_Department WHERE CTE_Department.Id = [dbo].[Department].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
