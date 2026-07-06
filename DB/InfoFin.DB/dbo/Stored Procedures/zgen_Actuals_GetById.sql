/****** Object:  StoredProcedure [dbo].[zgen_Actuals_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Actuals
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Actuals_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Actuals] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Actuals] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Actuals] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Actuals] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END