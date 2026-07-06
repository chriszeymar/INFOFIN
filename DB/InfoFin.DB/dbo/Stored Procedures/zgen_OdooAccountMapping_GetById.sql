/****** Object:  StoredProcedure [dbo].[zgen_OdooAccountMapping_GetById] ******/
-- ===================================================================
-- Description    : Select By Id OdooAccountMapping
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooAccountMapping_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[OdooAccountMapping] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[OdooAccountMapping] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[OdooAccountMapping] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[OdooAccountMapping] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END