/****** Object:  StoredProcedure [dbo].[zgen_Department_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Department
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Department_GetByIds]
    @DepartmentGroupId INT = NULL,
    @IsActive BIT = NULL,
    @SortDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, DepartmentGroupId, IsActive
    FROM [dbo].[Department]
    WHERE (@DepartmentGroupId IS NULL OR DepartmentGroupId = @DepartmentGroupId)
      AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY
        CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
        CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC;
END
