/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestAttachment_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging SpendRequestAttachment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestAttachment_GetByIdsPaging]
  (@SpendRequestId INT=NULL,@UploadedByUserId INT=NULL,@IsActive BIT=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    WITH CTE_SpendRequestAttachment AS (
    SELECT * FROM [dbo].[SpendRequestAttachment] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[SpendRequestAttachment]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
    )
    SELECT TotalRows, [dbo].[SpendRequestAttachment].* FROM [dbo].[SpendRequestAttachment], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_SpendRequestAttachment WHERE CTE_SpendRequestAttachment.Id = [dbo].[SpendRequestAttachment].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    WITH CTE_SpendRequestAttachment AS (
    SELECT * FROM [dbo].[SpendRequestAttachment] WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
 AND IsActive = @IsActive
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY),
    CTE_TotalRows AS
    (
      SELECT COUNT(Id) AS TotalRows FROM [dbo].[SpendRequestAttachment]
      WHERE (@SpendRequestId IS NULL OR [SpendRequestId] = @SpendRequestId) AND (@UploadedByUserId IS NULL OR [UploadedByUserId] = @UploadedByUserId) 
      AND IsActive = @IsActive
    )
    SELECT TotalRows, [dbo].[SpendRequestAttachment].* FROM [dbo].[SpendRequestAttachment], CTE_TotalRows
    WHERE EXISTS (SELECT 1 FROM CTE_SpendRequestAttachment WHERE CTE_SpendRequestAttachment.Id = [dbo].[SpendRequestAttachment].Id)
    ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
