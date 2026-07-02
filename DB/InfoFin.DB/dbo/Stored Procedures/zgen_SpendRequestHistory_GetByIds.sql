/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestHistory_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids SpendRequestHistory
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestHistory_GetByIds]
  (@SpendRequestId INT=NULL,@ActionById INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[SpendRequestHistory] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[SpendRequestHistory] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@ActionById IS NULL OR [ActionById] = @ActionById) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
