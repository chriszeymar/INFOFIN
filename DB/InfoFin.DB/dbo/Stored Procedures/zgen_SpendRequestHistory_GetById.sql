/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestHistory_GetById] ******/
-- ===================================================================
-- Description    : Select By Id SpendRequestHistory
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestHistory_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequestHistory] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[SpendRequestHistory] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequestHistory] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[SpendRequestHistory] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END