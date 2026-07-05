/****** Object:  StoredProcedure [dbo].[zgen_Budget_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids Budget
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Budget_GetByIds]
    @DepartmentId INT = NULL,
    @CategoryId INT = NULL,
    @CurrencyId INT = NULL,
    @IsActive BIT = NULL,
    @SortDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, DepartmentId, CategoryId, Year, Month, ForecastAmount, CurrencyId, CreateDT, UpdateDT
    FROM [dbo].[Budget]
    WHERE (@DepartmentId IS NULL OR DepartmentId = @DepartmentId)
      AND (@CategoryId IS NULL OR CategoryId = @CategoryId)
      AND (@CurrencyId IS NULL OR CurrencyId = @CurrencyId)
    ORDER BY
        CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
        CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC;
END
