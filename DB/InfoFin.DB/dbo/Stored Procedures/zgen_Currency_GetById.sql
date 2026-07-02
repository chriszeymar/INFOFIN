/****** Object:  StoredProcedure [dbo].[zgen_Currency_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Currency
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Currency_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Currency] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Currency] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Currency] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Currency] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END