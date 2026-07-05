/****** Object:  StoredProcedure [dbo].[zgen_Category_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Category
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Category_GetByIds]
    @FinancialGroupId INT = NULL,
    @ClassificationId INT = NULL,
    @IsActive BIT = NULL,
    @SortDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, FinancialGroupId, ClassificationId, IsActive
    FROM [dbo].[Category]
    WHERE (@FinancialGroupId IS NULL OR FinancialGroupId = @FinancialGroupId)
      AND (@ClassificationId IS NULL OR ClassificationId = @ClassificationId)
      AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY
        CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
        CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC;
END
