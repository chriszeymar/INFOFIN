/****** Object:  StoredProcedure [dbo].[zgen_DepartmentGroup_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids DepartmentGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_DepartmentGroup_GetByIds]
  (@BucketTypeId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[DepartmentGroup] WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[DepartmentGroup] WHERE (@BucketTypeId IS NULL OR [BucketTypeId] = @BucketTypeId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
