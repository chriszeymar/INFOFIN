/****** Object:  StoredProcedure [dbo].[zgen_SpendRequest_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids SpendRequest
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequest_GetByIds]
  (@DepartmentId INT=NULL,@CategoryId INT=NULL,@EncoderId INT=NULL,@CurrencyId INT=NULL,@AssignedToUserId INT=NULL,@VendorId INT=NULL,@IsActive bit=NULL,@SortDirection varchar(5)='ASC')
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @IsActive IS NULL
  BEGIN
    SELECT * FROM [dbo].[SpendRequest] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@EncoderId IS NULL OR [EncoderId] = @EncoderId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) AND (@AssignedToUserId IS NULL OR [AssignedToUserId] = @AssignedToUserId) AND (@VendorId IS NULL OR [VendorId] = @VendorId) 
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[SpendRequest] WHERE (@DepartmentId IS NULL OR [DepartmentId] = @DepartmentId) AND (@CategoryId IS NULL OR [CategoryId] = @CategoryId) AND (@EncoderId IS NULL OR [EncoderId] = @EncoderId) AND (@CurrencyId IS NULL OR [CurrencyId] = @CurrencyId) AND (@AssignedToUserId IS NULL OR [AssignedToUserId] = @AssignedToUserId) AND (@VendorId IS NULL OR [VendorId] = @VendorId) 
    AND IsActive = @IsActive
    ORDER BY 
    CASE WHEN @SortDirection = 'ASC' THEN CreateDT END ASC, CASE WHEN @SortDirection = 'DESC' THEN CreateDT END DESC
    OPTION (RECOMPILE);
  END
END
