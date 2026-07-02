/****** Object:  StoredProcedure [dbo].[zgen_Classification_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id Classification
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Classification_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[Classification] WHERE [Id] IN (Select Id FROM @Ids);
END