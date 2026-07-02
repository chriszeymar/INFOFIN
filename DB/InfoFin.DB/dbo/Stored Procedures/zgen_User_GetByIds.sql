/****** Object:  StoredProcedure [dbo].[zgen_User_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids User
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_User_GetByIds]
  (@RoleId INT=NULL,@DepartmentId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[User] WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[User] WHERE (@RoleId IS NULL OR [RoleId] = @RoleId) AND (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
