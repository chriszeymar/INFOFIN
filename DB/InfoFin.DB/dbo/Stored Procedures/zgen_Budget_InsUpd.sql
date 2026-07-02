/****** Object:  StoredProcedure [dbo].[zgen_Budget_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update Budget
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_Budget_InsUpd]
  (@DepartmentId INT,@CategoryId INT,@Year INT,@ForecastAmount DECIMAL(18,2),@CurrencyId INT,@Id INT=NULL,@Month INT=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[Budget]
        ([DepartmentId],[CategoryId],[Year],[ForecastAmount],[CurrencyId],[Month])
      VALUES
        (@DepartmentId,@CategoryId,@Year,@ForecastAmount,@CurrencyId,@Month);
      SELECT * FROM [dbo].[Budget] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[Budget]
        SET [DepartmentId]=@DepartmentId,[CategoryId]=@CategoryId,[Year]=@Year,[ForecastAmount]=@ForecastAmount,[CurrencyId]=@CurrencyId,[Month]=@Month,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[Budget] WHERE [Id] = @Id;
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
