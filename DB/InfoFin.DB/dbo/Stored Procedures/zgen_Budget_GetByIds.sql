/****** Object:  StoredProcedure [dbo].[zgen_Budget_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Budget
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Budget_GetByIds]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@CurrencyId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[Budget] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[Budget] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
