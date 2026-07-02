/****** Object:  StoredProcedure [dbo].[zgen_Vendor_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id Vendor
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Vendor_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[Vendor] WHERE [Id] IN (Select Id FROM @Ids);
END