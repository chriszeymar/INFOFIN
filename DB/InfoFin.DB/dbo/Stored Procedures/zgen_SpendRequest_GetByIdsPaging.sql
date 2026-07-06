/****** Object:  StoredProcedure [dbo].[zgen_SpendRequest_GetByIdsPaging] ******/
-- ===================================================================
-- Description    : Select By Ids Paging SpendRequest
-- ===================================================================

CREATE OR ALTER PROCEDURE [dbo].[zgen_SpendRequest_GetByIdsPaging]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@EncoderId INT=NULL,@CurrencyId INT=NULL,@AssignedToUserId INT=NULL,@VendorId INT=NULL,@IsActive bit=NULL,@PageNumber INT=1,@PageSize INT=50,@SortDirection VARCHAR(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  WITH CTE_SpendRequest AS (
    SELECT * FROM [dbo].[SpendRequest]
    WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId)
      AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId)
      AND (@EncoderId IS NULL OR [EncoderId] = @EncoderId)
      AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId)
      AND (@AssignedToUserId IS NULL OR [AssignedToUserId] = @AssignedToUserId)
      AND (@VendorId IS NULL OR [VendorId] = @VendorId)
    ORDER BY
      CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC,
      CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OFFSET @PageSize * (@PageNumber - 1) ROWS FETCH NEXT @PageSize ROWS ONLY
  ),
  CTE_TotalRows AS (
    SELECT COUNT(Id) AS TotalRows FROM [dbo].[SpendRequest]
    WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId)
      AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId)
      AND (@EncoderId IS NULL OR [EncoderId] = @EncoderId)
      AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId)
      AND (@AssignedToUserId IS NULL OR [AssignedToUserId] = @AssignedToUserId)
      AND (@VendorId IS NULL OR [VendorId] = @VendorId)
  )
  SELECT TotalRows, [dbo].[SpendRequest].* FROM [dbo].[SpendRequest], CTE_TotalRows
  WHERE EXISTS (SELECT 1 FROM CTE_SpendRequest WHERE CTE_SpendRequest.Id = [dbo].[SpendRequest].Id)
  ORDER BY
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC,
    CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
  OPTION (RECOMPILE);
END


