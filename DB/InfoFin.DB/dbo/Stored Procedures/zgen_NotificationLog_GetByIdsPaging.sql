/****** Object:  StoredProcedure [dbo].[zgen_NotificationLog_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging NotificationLog
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_NotificationLog_GetByIdsPaging]
  (@SpendRequestId INT=NULL,@RecipientUserId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_NotificationLog AS (
    SELECT * FROM [dbo].[NotificationLog] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[NotificationLog]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
    )
    SELECT TotalRows, [dbo].[NotificationLog].* FROM [dbo].[NotificationLog], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_NotificationLog WHERE CTE_NotificationLog.Id = [dbo].[NotificationLog].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_NotificationLog AS (
    SELECT * FROM [dbo].[NotificationLog] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[NotificationLog]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[NotificationLog].* FROM [dbo].[NotificationLog], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_NotificationLog WHERE CTE_NotificationLog.Id = [dbo].[NotificationLog].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
