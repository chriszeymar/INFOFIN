/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestAttachment_GetById] ******/
-- ===================================================================
-- Description    : Select By Id SpendRequestAttachment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestAttachment_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequestAttachment] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[SpendRequestAttachment] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[SpendRequestAttachment] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[SpendRequestAttachment] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END