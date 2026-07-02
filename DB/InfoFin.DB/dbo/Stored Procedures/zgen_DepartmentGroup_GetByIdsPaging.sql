/****** Object:  StoredProcedure [dbo].[zgen_DepartmentGroup_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging DepartmentGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_DepartmentGroup_GetByIdsPaging]
  (@BucketTypeId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_DepartmentGroup AS (
    SELECT * FROM [dbo].[DepartmentGroup] WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[DepartmentGroup]
      WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
    )
    SELECT TotalRows, [dbo].[DepartmentGroup].* FROM [dbo].[DepartmentGroup], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_DepartmentGroup WHERE CTE_DepartmentGroup.Id = [dbo].[DepartmentGroup].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_DepartmentGroup AS (
    SELECT * FROM [dbo].[DepartmentGroup] WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[DepartmentGroup]
      WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[DepartmentGroup].* FROM [dbo].[DepartmentGroup], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_DepartmentGroup WHERE CTE_DepartmentGroup.Id = [dbo].[DepartmentGroup].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
