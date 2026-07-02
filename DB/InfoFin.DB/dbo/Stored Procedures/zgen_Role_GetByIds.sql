/****** Object:  StoredProcedure [dbo].[zgen_Role_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id Role
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Role_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[Role] WHERE [Id] IN (Select Id FROM @Ids);
END