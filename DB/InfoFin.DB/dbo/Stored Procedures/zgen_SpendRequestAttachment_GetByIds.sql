/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestAttachment_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids SpendRequestAttachment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestAttachment_GetByIds]
  (@SpendRequestId INT=NULL,@UploadedByUserId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[SpendRequestAttachment] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[SpendRequestAttachment] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
