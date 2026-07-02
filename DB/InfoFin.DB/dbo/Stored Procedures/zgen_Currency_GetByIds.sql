/****** Object:  StoredProcedure [dbo].[zgen_Currency_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id Currency
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Currency_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[Currency] WHERE [Id] IN (Select Id FROM @Ids);
END