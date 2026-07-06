/****** Object:  StoredProcedure [dbo].[zgen_Actuals_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Actuals
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Actuals_GetByIds]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[Actuals] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[Actuals] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
