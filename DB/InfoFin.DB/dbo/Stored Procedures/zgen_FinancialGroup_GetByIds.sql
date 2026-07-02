/****** Object:  StoredProcedure [dbo].[zgen_FinancialGroup_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id FinancialGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_FinancialGroup_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[FinancialGroup] WHERE [Id] IN (Select Id FROM @Ids);
END