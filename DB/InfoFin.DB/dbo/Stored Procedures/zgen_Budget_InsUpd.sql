/****** Object:  StoredProcedure [dbo].[zgen_Budget_InsUpd] ******/
-- ===================================================================
-- Description    : Insert Update Budget
-- ===================================================================

CREATE PROCEDURE dbo.zgen_Budget_InsUpd
  (@DepartmentId INT,@CategoryId INT,@Year INT,@ForecastAmount DECIMAL(18,2),@CurrencyId INT,@Id INT=NULL,@Month INT=NULL,@RetMsg NVARCHAR(MAX) OUTPUT)
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @ExistingId INT;
  SELECT @ExistingId = Id FROM dbo.Budget
  WHERE DepartmentId=@DepartmentId AND CategoryId=@CategoryId AND Year=@Year AND (Month=@Month OR (Month IS NULL AND @Month IS NULL));

  IF @ExistingId IS NOT NULL
  BEGIN
    UPDATE dbo.Budget SET ForecastAmount=@ForecastAmount, CurrencyId=@CurrencyId, UpdateDT=GETDATE() WHERE Id=@ExistingId;
    SELECT * FROM dbo.Budget WHERE Id=@ExistingId;
    SET @RetMsg='Upserted';
  END
  ELSE IF @Id IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.Budget WHERE Id=@Id)
  BEGIN
    UPDATE dbo.Budget SET DepartmentId=@DepartmentId,CategoryId=@CategoryId,Year=@Year,Month=@Month,ForecastAmount=@ForecastAmount,CurrencyId=@CurrencyId,UpdateDT=GETDATE() WHERE Id=@Id;
    SELECT * FROM dbo.Budget WHERE Id=@Id;
    SET @RetMsg='Updated';
  END
  ELSE
  BEGIN
    INSERT INTO dbo.Budget (DepartmentId,CategoryId,Year,Month,ForecastAmount,CurrencyId) VALUES (@DepartmentId,@CategoryId,@Year,@Month,@ForecastAmount,@CurrencyId);
    SELECT * FROM dbo.Budget WHERE Id=SCOPE_IDENTITY();
    SET @RetMsg='Inserted';
  END
  RETURN 0;
END
