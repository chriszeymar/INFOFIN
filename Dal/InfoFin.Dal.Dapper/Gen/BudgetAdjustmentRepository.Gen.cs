using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class BudgetAdjustmentRepository : BaseRepository, IBudgetAdjustmentRepository
    {
        public BudgetAdjustmentRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelBudgetAdjustmentHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_BudgetAdjustment_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelBudgetAdjustmentSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_BudgetAdjustment_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentById(int? id, bool? isActive)
        {
            List<InfoFin.Model.BudgetAdjustment> retBudgetAdjustment = new List<InfoFin.Model.BudgetAdjustment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retBudgetAdjustment = (await connection.QueryAsync<InfoFin.Model.BudgetAdjustment>("dbo.zgen_BudgetAdjustment_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudgetAdjustment;
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIds(int? budgetId, int? adjustedByUserId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.BudgetAdjustment> retBudgetAdjustment = new List<InfoFin.Model.BudgetAdjustment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("BudgetId", budgetId);
            dParams.Add("AdjustedByUserId", adjustedByUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retBudgetAdjustment = (await connection.QueryAsync<InfoFin.Model.BudgetAdjustment>("dbo.zgen_BudgetAdjustment_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudgetAdjustment;
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIdsPaging(int? budgetId, int? adjustedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.BudgetAdjustment> retBudgetAdjustment = new List<InfoFin.Model.BudgetAdjustment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("BudgetId", budgetId);
            dParams.Add("AdjustedByUserId", adjustedByUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retBudgetAdjustment = (await connection.QueryAsync<InfoFin.Model.BudgetAdjustment>("dbo.zgen_BudgetAdjustment_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudgetAdjustment;
        }

        public async Task<InfoFin.Model.BudgetAdjustment> InsUpdBudgetAdjustment(InfoFin.Model.BudgetAdjustment budgetAdjustment)
        {
            InfoFin.Model.BudgetAdjustment retBudgetAdjustment;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("BudgetId", budgetAdjustment.BudgetId);
            dParams.Add("OldAmount", budgetAdjustment.OldAmount);
            dParams.Add("NewAmount", budgetAdjustment.NewAmount);
            dParams.Add("AdjustedByUserId", budgetAdjustment.AdjustedByUserId);
            if (budgetAdjustment.Id != null)
                dParams.Add("Id", budgetAdjustment.Id);
            if (budgetAdjustment.Reason != null)
                dParams.Add("Reason", budgetAdjustment.Reason);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retBudgetAdjustment = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.BudgetAdjustment>("dbo.zgen_BudgetAdjustment_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retBudgetAdjustment;
        }
    }
}