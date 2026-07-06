/****** Object:  StoredProcedure [dbo].[zgen_OdooJournalLine_GetByOdooLineId] ******/
-- ===================================================================
-- Description    : Select By OdooLineId OdooJournalLine
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooJournalLine_GetByOdooLineId]
  (@OdooLineId int)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[OdooJournalLine] WHERE OdooLineId = @OdooLineId
END