/****** Object:  StoredProcedure [dbo].[zgen_Department_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Department
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Department_GetByIds]
  (@DepartmentGroupId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[Department] WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[Department] WHERE (@DepartmentGroupId IS NULL OR [DepartmentGroupId] = @DepartmentGroupId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
