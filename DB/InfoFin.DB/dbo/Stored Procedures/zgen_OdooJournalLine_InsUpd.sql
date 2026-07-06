/****** Object:  StoredProcedure [dbo].[zgen_OdooJournalLine_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update OdooJournalLine
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_OdooJournalLine_InsUpd]
  (@OdooLineId INT,@OdooCompanyId INT,@OdooAccountId INT,@Date DATE,@Debit DECIMAL(18, 2)=0,@Credit DECIMAL(18, 2)=0,@ImportedAt DATETIME,@Id INT=NULL,@OdooCompanyName NVARCHAR(200)=NULL,@OdooAccountCode NVARCHAR(100)=NULL,@OdooAccountName NVARCHAR(200)=NULL,@State NVARCHAR(20)=NULL,@OdooWriteDate DATETIME=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[OdooJournalLine]
        ([OdooLineId],[OdooCompanyId],[OdooAccountId],[Date],[Debit],[Credit],[ImportedAt],[OdooCompanyName],[OdooAccountCode],[OdooAccountName],[State],[OdooWriteDate])
      VALUES
        (@OdooLineId,@OdooCompanyId,@OdooAccountId,@Date,@Debit,@Credit,@ImportedAt,@OdooCompanyName,@OdooAccountCode,@OdooAccountName,@State,@OdooWriteDate);
      SELECT * FROM [dbo].[OdooJournalLine] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[OdooJournalLine]
        SET [OdooLineId]=@OdooLineId,[OdooCompanyId]=@OdooCompanyId,[OdooAccountId]=@OdooAccountId,[Date]=@Date,[Debit]=@Debit,[Credit]=@Credit,[ImportedAt]=@ImportedAt,[OdooCompanyName]=@OdooCompanyName,[OdooAccountCode]=@OdooAccountCode,[OdooAccountName]=@OdooAccountName,[State]=@State,[OdooWriteDate]=@OdooWriteDate,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[OdooJournalLine] WHERE [Id] = @Id;
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
