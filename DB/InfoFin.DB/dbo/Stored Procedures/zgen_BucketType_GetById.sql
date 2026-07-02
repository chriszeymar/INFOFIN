/****** Object:  StoredProcedure [dbo].[zgen_BucketType_GetById] ******/
-- ===================================================================
-- Description    : Select By Id BucketType
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BucketType_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[BucketType] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[BucketType] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[BucketType] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[BucketType] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END