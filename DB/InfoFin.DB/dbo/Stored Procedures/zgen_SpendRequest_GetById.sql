/****** Object:  StoredProcedure [dbo].[zgen_SpendRequest_GetById] ******/
-- ===================================================================
-- Description    : Select By Id SpendRequest
-- ===================================================================

CREATE OR ALTER PROCEDURE [dbo].[zgen_SpendRequest_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    SELECT * FROM [dbo].[SpendRequest] ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    SELECT * FROM [dbo].[SpendRequest] WHERE [Id] = @Id;
  END
END

