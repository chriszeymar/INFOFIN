/****** Object:  StoredProcedure [dbo].[zgen_FinancialGroup_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update FinancialGroup
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_FinancialGroup_InsUpd]
  (@Name NVARCHAR(50),@Id INT=NULL,@IsActive BIT=1,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[FinancialGroup]
        ([Name],[IsActive])
      VALUES
        (@Name,@IsActive);
      SELECT * FROM [dbo].[FinancialGroup] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[FinancialGroup]
        SET [Name]=@Name,[IsActive]=@IsActive,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[FinancialGroup] WHERE [Id] = @Id;
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
