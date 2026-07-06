/****** Object:  StoredProcedure [dbo].[zgen_Category_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update Category
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Category_InsUpd]
  (@Name NVARCHAR(200),@FinancialGroupId INT,@Id INT=NULL,@ClassificationId INT=NULL,@OdooAccountId INT=NULL,@OdooAccountCode NVARCHAR(100)=NULL,@OdooAccountType NVARCHAR(50)=NULL,@IsActive BIT=1,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[Category]
        ([Name],[FinancialGroupId],[ClassificationId],[OdooAccountId],[OdooAccountCode],[OdooAccountType],[IsActive])
      VALUES
        (@Name,@FinancialGroupId,@ClassificationId,@OdooAccountId,@OdooAccountCode,@OdooAccountType,@IsActive);
      SELECT * FROM [dbo].[Category] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[Category]
        SET [Name]=@Name,[FinancialGroupId]=@FinancialGroupId,[ClassificationId]=@ClassificationId,[OdooAccountId]=@OdooAccountId,[OdooAccountCode]=@OdooAccountCode,[OdooAccountType]=@OdooAccountType,[IsActive]=@IsActive,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[Category] WHERE [Id] = @Id;
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
