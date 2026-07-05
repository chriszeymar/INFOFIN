/****** Object:  StoredProcedure [dbo].[zgen_DepartmentGroup_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids DepartmentGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_DepartmentGroup_GetByIds]
    @BucketTypeId INT = NULL,
    @IsActive BIT = NULL,
    @SortDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, BucketTypeId, IsActive
    FROM [dbo].[DepartmentGroup]
    WHERE (@BucketTypeId IS NULL OR BucketTypeId = @BucketTypeId)
      AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY
        CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
        CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC;
END
