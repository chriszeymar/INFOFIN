/****** Object:  StoredProcedure [dbo].[zgen_OdooAccountMapping_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids OdooAccountMapping
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooAccountMapping_GetByIds]
  (@InfoFinCategoryId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[OdooAccountMapping] WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[OdooAccountMapping] WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
