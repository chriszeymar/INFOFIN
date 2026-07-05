/****** Object:  StoredProcedure [dbo].[zgen_User_GetById] ******/
-- ===================================================================
-- Description    : Select By Id User
-- ===================================================================

CREATE   PROCEDURE dbo.zgen_User_GetById
    @Id INT = NULL, @IsActive BIT = NULL
AS BEGIN SET NOCOUNT ON;
    SELECT Id, Email, PasswordHash, RoleId, DepartmentId, IsActive, CreateDT, UpdateDT
    FROM dbo.[User] WHERE (@Id IS NULL OR Id = @Id) AND (@IsActive IS NULL OR IsActive = @IsActive);
END;