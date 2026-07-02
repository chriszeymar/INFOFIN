/****** Object:  StoredProcedure [dbo].[zgen_NotificationLog_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids NotificationLog
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_NotificationLog_GetByIds]
  (@SpendRequestId INT=NULL,@RecipientUserId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[NotificationLog] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[NotificationLog] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@RecipientUserId IS NULL OR [RecipientUserId] = @RecipientUserId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
