using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class ActualsRepository : BaseRepository, IActualsRepository
    {
        public ActualsRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelActualsHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Actuals_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelActualsSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Actuals_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Actuals> retActuals = new List<InfoFin.Model.Actuals>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retActuals = (await connection.QueryAsync<InfoFin.Model.Actuals>("dbo.zgen_Actuals_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retActuals;
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsByIds(int? departmentId, int? accountId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Actuals> retActuals = new List<InfoFin.Model.Actuals>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("AccountId", accountId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retActuals = (await connection.QueryAsync<InfoFin.Model.Actuals>("dbo.zgen_Actuals_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retActuals;
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsByIdsPaging(int? departmentId, int? accountId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Actuals> retActuals = new List<InfoFin.Model.Actuals>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("AccountId", accountId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retActuals = (await connection.QueryAsync<InfoFin.Model.Actuals>("dbo.zgen_Actuals_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retActuals;
        }

        public async Task<InfoFin.Model.Actuals> InsUpdActuals(InfoFin.Model.Actuals actuals)
        {
            InfoFin.Model.Actuals retActuals;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", actuals.DepartmentId);
            dParams.Add("AccountId", actuals.AccountId);
            dParams.Add("Year", actuals.Year);
            dParams.Add("Amount", actuals.Amount);
            if (actuals.Id != null)
                dParams.Add("Id", actuals.Id);
            if (actuals.Month != null)
                dParams.Add("Month", actuals.Month);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retActuals = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Actuals>("dbo.zgen_Actuals_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retActuals;
        }
    }
}