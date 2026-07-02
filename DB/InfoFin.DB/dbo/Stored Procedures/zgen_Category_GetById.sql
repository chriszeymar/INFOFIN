/****** Object:  StoredProcedure [dbo].[zgen_Category_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Category
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Category_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Category] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Category] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Category] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Category] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END