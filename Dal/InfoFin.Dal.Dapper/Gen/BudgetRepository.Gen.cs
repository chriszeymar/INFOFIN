using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class BudgetRepository : BaseRepository, IBudgetRepository
    {
        public BudgetRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelBudgetHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Budget_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelBudgetSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Budget_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Budget> retBudget = new List<InfoFin.Model.Budget>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retBudget = (await connection.QueryAsync<InfoFin.Model.Budget>("dbo.zgen_Budget_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudget;
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetByIds(int? departmentId, int? categoryId, int? currencyId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Budget> retBudget = new List<InfoFin.Model.Budget>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("CategoryId", categoryId);
            dParams.Add("CurrencyId", currencyId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retBudget = (await connection.QueryAsync<InfoFin.Model.Budget>("dbo.zgen_Budget_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudget;
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetByIdsPaging(int? departmentId, int? categoryId, int? currencyId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Budget> retBudget = new List<InfoFin.Model.Budget>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("CategoryId", categoryId);
            dParams.Add("CurrencyId", currencyId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retBudget = (await connection.QueryAsync<InfoFin.Model.Budget>("dbo.zgen_Budget_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBudget;
        }

        public async Task<InfoFin.Model.Budget> InsUpdBudget(InfoFin.Model.Budget budget)
        {
            InfoFin.Model.Budget retBudget;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", budget.DepartmentId);
            dParams.Add("CategoryId", budget.CategoryId);
            dParams.Add("Year", budget.Year);
            dParams.Add("ForecastAmount", budget.ForecastAmount);
            dParams.Add("CurrencyId", budget.CurrencyId);
            if (budget.Id != null)
                dParams.Add("Id", budget.Id);
            if (budget.Month != null)
                dParams.Add("Month", budget.Month);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retBudget = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Budget>("dbo.zgen_Budget_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retBudget;
        }
    }
}