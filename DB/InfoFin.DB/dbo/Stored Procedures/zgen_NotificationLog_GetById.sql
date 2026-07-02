/****** Object:  StoredProcedure [dbo].[zgen_NotificationLog_GetById] ******/
-- ===================================================================
-- Description    : Select By Id NotificationLog
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_NotificationLog_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[NotificationLog] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[NotificationLog] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[NotificationLog] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[NotificationLog] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END