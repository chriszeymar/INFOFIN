/****** Object:  StoredProcedure [dbo].[zgen_BucketType_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Id BucketType
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BucketType_GetByIds]
  (@Ids udtt_Ints READONLY)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

 SELECT * FROM [dbo].[BucketType] WHERE [Id] IN (Select Id FROM @Ids);
END