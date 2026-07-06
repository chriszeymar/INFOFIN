/****** Object:  StoredProcedure [dbo].[zgen_OdooJournalLine_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id OdooJournalLine
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooJournalLine_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[OdooJournalLine] WHERE [Id] IN (Select Id FROM @Ids);
END