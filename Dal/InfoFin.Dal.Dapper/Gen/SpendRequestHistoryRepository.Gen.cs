using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class SpendRequestHistoryRepository : BaseRepository, ISpendRequestHistoryRepository
    {
        public SpendRequestHistoryRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelSpendRequestHistoryHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequestHistory_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelSpendRequestHistorySft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequestHistory_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryById(int? id, bool? isActive)
        {
            List<InfoFin.Model.SpendRequestHistory> retSpendRequestHistory = new List<InfoFin.Model.SpendRequestHistory>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestHistory = (await connection.QueryAsync<InfoFin.Model.SpendRequestHistory>("dbo.zgen_SpendRequestHistory_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestHistory;
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIds(int? spendRequestId, int? actionById, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequestHistory> retSpendRequestHistory = new List<InfoFin.Model.SpendRequestHistory>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("ActionById", actionById);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestHistory = (await connection.QueryAsync<InfoFin.Model.SpendRequestHistory>("dbo.zgen_SpendRequestHistory_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestHistory;
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIdsPaging(int? spendRequestId, int? actionById, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequestHistory> retSpendRequestHistory = new List<InfoFin.Model.SpendRequestHistory>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("ActionById", actionById);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestHistory = (await connection.QueryAsync<InfoFin.Model.SpendRequestHistory>("dbo.zgen_SpendRequestHistory_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestHistory;
        }

        public async Task<InfoFin.Model.SpendRequestHistory> InsUpdSpendRequestHistory(InfoFin.Model.SpendRequestHistory spendRequestHistory)
        {
            InfoFin.Model.SpendRequestHistory retSpendRequestHistory;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestHistory.SpendRequestId);
            dParams.Add("ActionById", spendRequestHistory.ActionById);
            dParams.Add("OldStatus", spendRequestHistory.OldStatus);
            dParams.Add("NewStatus", spendRequestHistory.NewStatus);
            if (spendRequestHistory.Id != null)
                dParams.Add("Id", spendRequestHistory.Id);
            if (spendRequestHistory.Comments != null)
                dParams.Add("Comments", spendRequestHistory.Comments);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestHistory = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.SpendRequestHistory>("dbo.zgen_SpendRequestHistory_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retSpendRequestHistory;
        }
    }
}