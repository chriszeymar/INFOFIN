/****** Object:  StoredProcedure [dbo].[zgen_Department_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Department
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Department_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Department] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Department] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Department] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Department] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END