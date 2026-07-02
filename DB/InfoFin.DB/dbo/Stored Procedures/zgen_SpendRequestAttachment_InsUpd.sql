/****** Object:  StoredProcedure [dbo].[zgen_SpendRequestAttachment_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update SpendRequestAttachment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_SpendRequestAttachment_InsUpd]
  (@SpendRequestId INT,@FileUrl NVARCHAR(MAX),@FileName NVARCHAR(255),@UploadedByUserId INT,@Id INT=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[SpendRequestAttachment]
        ([SpendRequestId],[FileUrl],[FileName],[UploadedByUserId])
      VALUES
        (@SpendRequestId,@FileUrl,@FileName,@UploadedByUserId);
      SELECT * FROM [dbo].[SpendRequestAttachment] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[SpendRequestAttachment]
        SET [SpendRequestId]=@SpendRequestId,[FileUrl]=@FileUrl,[FileName]=@FileName,[UploadedByUserId]=@UploadedByUserId,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[SpendRequestAttachment] WHERE [Id] = @Id;
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
