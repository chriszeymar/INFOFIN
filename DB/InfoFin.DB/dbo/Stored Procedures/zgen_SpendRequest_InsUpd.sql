/****** Object:  StoredProcedure [dbo].[zgen_SpendRequest_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update SpendRequest
-- ===================================================================

CREATE OR ALTER PROCEDURE [dbo].[zgen_SpendRequest_InsUpd]
  (@ReferenceNumber NVARCHAR(50),@DepartmentId INT,@CategoryId INT,@EncoderId INT,@Amount DECIMAL(18, 2),@CurrencyId INT,@LockedExchangeRate DECIMAL(18, 6),@Description NVARCHAR(MAX),@Status NVARCHAR(50),@Id INT=NULL,@AssignedToUserId INT=NULL,@VendorId INT=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[SpendRequest]
        ([ReferenceNumber],[DepartmentId],[CategoryId],[EncoderId],[Amount],[CurrencyId],[LockedExchangeRate],[Description],[Status],[AssignedToUserId],[VendorId])
      VALUES
        (@ReferenceNumber,@DepartmentId,@CategoryId,@EncoderId,@Amount,@CurrencyId,@LockedExchangeRate,@Description,@Status,@AssignedToUserId,@VendorId);
      SELECT * FROM [dbo].[SpendRequest] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[SpendRequest]
        SET [ReferenceNumber]=@ReferenceNumber,[DepartmentId]=@DepartmentId,[CategoryId]=@CategoryId,[EncoderId]=@EncoderId,[Amount]=@Amount,[CurrencyId]=@CurrencyId,[LockedExchangeRate]=@LockedExchangeRate,[Description]=@Description,[Status]=@Status,[AssignedToUserId]=@AssignedToUserId,[VendorId]=@VendorId,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[SpendRequest] WHERE [Id] = @Id;
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


