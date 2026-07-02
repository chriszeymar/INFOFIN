/****** Object:  StoredProcedure [dbo].[zgen_Classification_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Classification
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Classification_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Classification] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Classification] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Classification] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Classification] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END