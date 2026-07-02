/****** Object:  StoredProcedure [dbo].[zgen_FinancialGroup_GetById] ******/
-- ===================================================================
-- Description    : Select By Id FinancialGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_FinancialGroup_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[FinancialGroup] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[FinancialGroup] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[FinancialGroup] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[FinancialGroup] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END