/****** Object:  StoredProcedure [dbo].[zgen_OdooAccountMapping_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging OdooAccountMapping
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooAccountMapping_GetByIdsPaging]
  (@InfoFinCategoryId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_OdooAccountMapping AS (
    SELECT * FROM [dbo].[OdooAccountMapping] WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[OdooAccountMapping]
      WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
    )
    SELECT TotalRows, [dbo].[OdooAccountMapping].* FROM [dbo].[OdooAccountMapping], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_OdooAccountMapping WHERE CTE_OdooAccountMapping.Id = [dbo].[OdooAccountMapping].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_OdooAccountMapping AS (
    SELECT * FROM [dbo].[OdooAccountMapping] WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[OdooAccountMapping]
      WHERE (@InfoFinCategoryId IS NULL OR [InfoFinCategoryId] = @InfoFinCategoryId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[OdooAccountMapping].* FROM [dbo].[OdooAccountMapping], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_OdooAccountMapping WHERE CTE_OdooAccountMapping.Id = [dbo].[OdooAccountMapping].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
