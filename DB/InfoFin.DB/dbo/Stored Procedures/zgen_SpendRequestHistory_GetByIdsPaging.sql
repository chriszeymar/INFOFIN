/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestHistory_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging SpendRequestHistory
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestHistory_GetByIdsPaging]
  (@SpendRequestId INT=NULL,@ActionById INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_SpendRequestHistory AS (
    SELECT * FROM [dbo].[SpendRequestHistory] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[SpendRequestHistory]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
    )
    SELECT TotalRows, [dbo].[SpendRequestHistory].* FROM [dbo].[SpendRequestHistory], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_SpendRequestHistory WHERE CTE_SpendRequestHistory.Id = [dbo].[SpendRequestHistory].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_SpendRequestHistory AS (
    SELECT * FROM [dbo].[SpendRequestHistory] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[SpendRequestHistory]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[SpendRequestHistory].* FROM [dbo].[SpendRequestHistory], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_SpendRequestHistory WHERE CTE_SpendRequestHistory.Id = [dbo].[SpendRequestHistory].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
