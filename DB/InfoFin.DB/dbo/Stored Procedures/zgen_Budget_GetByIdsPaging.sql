/****** Object:  StoredProcedure [dbo].[zgen_Budget_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging Budget
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Budget_GetByIdsPaging]
    @DepartmentId INT = NULL,
    @CategoryId INT = NULL,
    @CurrencyId INT = NULL,
    @IsActive BIT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @SortDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, DepartmentId, CategoryId, Year, Month, ForecastAmount, CurrencyId, CreateDT, UpdateDT,
           COUNT(*) OVER() AS TotalRows
    FROM [dbo].[Budget]
    WHERE (@DepartmentId IS NULL OR DepartmentId = @DepartmentId)
      AND (@CategoryId IS NULL OR CategoryId = @CategoryId)
      AND (@CurrencyId IS NULL OR CurrencyId = @CurrencyId)
    ORDER BY
        CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
        CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
