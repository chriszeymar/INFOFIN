/****** Object:  StoredProcedure [dbo].[zgen_BudgetAdjustment_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update BudgetAdjustment
-- ===================================================================

CREATE   PROCEDURE [dbo].[zgen_BudgetAdjustment_InsUpd]
  (@BudgetId INT,@OldAmount DECIMAL(18,2),@NewAmount DECIMAL(18,2),@AdjustedByUserId INT,@Id INT=NULL,@Reason NVARCHAR(MAX)=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  DECLARE @InitialTransCount INT = @@TRANCOUNT;
  DECLARE @TranName varchar(32) = OBJECT_NAME(@@PROCID);

  BEGIN TRY
    IF @InitialTransCount = 0 BEGIN TRANSACTION @TranName

    IF @Id IS NULL
    BEGIN
      INSERT INTO [dbo].[BudgetAdjustment]
        ([BudgetId],[OldAmount],[NewAmount],[AdjustedByUserId],[Reason])
      VALUES
        (@BudgetId,@OldAmount,@NewAmount,@AdjustedByUserId,@Reason);
      SELECT * FROM [dbo].[BudgetAdjustment] WHERE [Id] = SCOPE_IDENTITY();
    END
  ELSE
    BEGIN
      UPDATE [dbo].[BudgetAdjustment]
        SET [BudgetId]=@BudgetId,[OldAmount]=@OldAmount,[NewAmount]=@NewAmount,[AdjustedByUserId]=@AdjustedByUserId,[Reason]=@Reason,[UpdateDT]=GETDATE()
        WHERE ([Id] = @Id);
      SELECT * FROM [dbo].[BudgetAdjustment] WHERE [Id] = @Id;
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
