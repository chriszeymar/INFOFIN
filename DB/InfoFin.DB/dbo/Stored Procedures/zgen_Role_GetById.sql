/****** Object:  StoredProcedure [dbo].[zgen_Role_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Role
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Role_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Role] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[Role] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[Role] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[Role] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END