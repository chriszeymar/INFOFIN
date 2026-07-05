/****** Object:  StoredProcedure [dbo].[zgen_User_GetByIds] ******/
-- ===================================================================
-- Description    : Select By Ids User
-- ===================================================================

CREATE   PROCEDURE dbo.zgen_User_GetByIds
    @Id INT = NULL, @Email NVARCHAR(100) = NULL, @RoleId INT = NULL,
    @DepartmentId INT = NULL, @IsActive BIT = NULL, @SortDirection VARCHAR(4) = 'ASC'
AS BEGIN SET NOCOUNT ON;
    SELECT Id, Email, PasswordHash, RoleId, DepartmentId, IsActive, CreateDT, UpdateDT
    FROM dbo.[User]
    WHERE (@Id IS NULL OR Id = @Id) AND (@Email IS NULL OR Email = @Email)
      AND (@RoleId IS NULL OR RoleId = @RoleId)
      AND (@DepartmentId IS NULL OR DepartmentId = @DepartmentId)
      AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY CASE WHEN @SortDirection = 'DESC' THEN Id END DESC,
             CASE WHEN @SortDirection <> 'DESC' THEN Id END ASC;
END;
