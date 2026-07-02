/****** Object:  StoredProcedure [dbo].[zgen_Category_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Category
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Category_GetByIds]
  (@FinancialGroupId INT=NULL,@ClassificationId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[Category] WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[Category] WHERE (@FinancialGroupId IS NULL OR [FinancialGroupId] = @FinancialGroupId) AND (@ClassificationId IS NULL OR [ClassificationId] = @ClassificationId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
