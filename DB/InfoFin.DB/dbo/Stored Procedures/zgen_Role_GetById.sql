/****** Object:  StoredProcedure [dbo].[zgen_Role_GetById] ******/
-- ===================================================================
-- Description    : Select By Id Role
-- ===================================================================

CREATE   PROCEDURE dbo.zgen_Role_GetById
    @Id INT = NULL, @IsActive BIT = NULL
AS BEGIN SET NOCOUNT ON;
    SELECT Id, Name, IsActive FROM dbo.[Role] WHERE (@Id IS NULL OR Id = @Id) AND (@IsActive IS NULL OR IsActive = @IsActive);
END;