/****** Object:  StoredProcedure [dbo].[zgen_DepartmentGroup_GetById] ******/
-- ===================================================================
-- Description    : Select By Id DepartmentGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_DepartmentGroup_GetById]
  (@Id INT, @IsActive bit=NULL)
AS
BEGIN
  SET NOCOUNT ON;
  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

  IF @Id IS NULL
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[DepartmentGroup] ORDER BY [Id] ASC;
    ELSE
      SELECT * FROM [dbo].[DepartmentGroup] WHERE [IsActive] = @IsActive ORDER BY [Id] ASC;
  END
  ELSE
  BEGIN
    IF @IsActive IS NULL
      SELECT * FROM [dbo].[DepartmentGroup] WHERE [Id] = @Id;
    ELSE
      SELECT * FROM [dbo].[DepartmentGroup] WHERE [Id] = @Id AND IsActive = @IsActive;
  END
END