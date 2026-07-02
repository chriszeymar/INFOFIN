/****** Object:  StoredProcedure [dbo].[zgen_SpendRequest_GetById] ******/
-- ===================================================================
-- Description    : Select By Id SpendRequest
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequest_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequest] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[SpendRequest] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequest] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[SpendRequest] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END