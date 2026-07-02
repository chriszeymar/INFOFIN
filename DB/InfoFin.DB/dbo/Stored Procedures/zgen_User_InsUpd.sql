/****** Object:  StoredProcedure [dbo].[zgen_User_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update User
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_User_InsUpd]
  (@Email NVARCHAR(100),@PasswordHash NVARCHAR(MAX),@RoleId INT,@Id INT=NULL,@DepartmentId INT=NULL,@IsActive BIT,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[User]
        ([Email],[PasswordHash],[RoleId],[DepartmentId],[IsActive])
      VALUES
        (@Email,@PasswordHash,@RoleId,@DepartmentId,@IsActive);
      SELECT * FROM [dbo].[User] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[User]
        SET [Email]=@Email,[PasswordHash]=@PasswordHash,[RoleId]=@RoleId,[DepartmentId]=@DepartmentId,[IsActive]=@IsActive,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[User] WHERE [Id] = @Id;
    END

    IF @@ERROR <> 0 BEGIN GOTO errorMsg_section END

    IF @InitialTransCount = 0 COMMIT TRANSACTION @TranName
    SET @RetMsg = LTRIM(ISNULL(@RetMsg, '') + 'Successful')
    RETURN 0

  errorMsg_section:
    SET @RetMsg = LTRIM(ISNULL(@RetMsg, '') + ' SQLErrMSG: ' + ISNULL(ERROR_MESSAGE(), ''))
    GOTO error_section

  error_section:
    SET @RetMsg = ISNULL(@RetMsg, '')
    IF @InitialTransCount = 0 ROLLBACK TRANSACTION @TranName
    RETURN 1
  END TRY
  BEGIN CATCH
    IF @InitialTransCount = 0 ROLLBACK TRANSACTION @TranName
    SET @RetMsg = LTRIM(ISNULL(@RetMsg, '') + ' SQLErrMSG: ' + ISNULL(ERROR_MESSAGE(), ''))
    RETURN 1
  END CATCH
END
