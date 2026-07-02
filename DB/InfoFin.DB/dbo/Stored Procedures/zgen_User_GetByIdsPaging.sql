/****** Object:  StoredProcedure [dbo].[zgen_User_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging User
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_User_GetByIdsPaging]
  (@RoleId INT=NULL,@DepartmentId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_User AS (
    SELECT * FROM [dbo].[User] WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[User]
      WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
    )
    SELECT TotalRows, [dbo].[User].* FROM [dbo].[User], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_User WHERE CTE_User.Id = [dbo].[User].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_User AS (
    SELECT * FROM [dbo].[User] WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[User]
      WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[User].* FROM [dbo].[User], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_User WHERE CTE_User.Id = [dbo].[User].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
