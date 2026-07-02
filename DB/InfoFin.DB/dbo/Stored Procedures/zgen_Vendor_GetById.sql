/****** Object:  StoredProcedure [dbo].[zgen_Vendor_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Vendor
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Vendor_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Vendor] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Vendor] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Vendor] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Vendor] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END