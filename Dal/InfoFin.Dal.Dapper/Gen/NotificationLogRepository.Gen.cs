using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class NotificationLogRepository : BaseRepository, INotificationLogRepository
    {
        public NotificationLogRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelNotificationLogHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_NotificationLog_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelNotificationLogSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_NotificationLog_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogById(int? id, bool? isActive)
        {
            List<InfoFin.Model.NotificationLog> retNotificationLog = new List<InfoFin.Model.NotificationLog>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retNotificationLog = (await connection.QueryAsync<InfoFin.Model.NotificationLog>("dbo.zgen_NotificationLog_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retNotificationLog;
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIds(int? spendRequestId, int? recipientUserId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.NotificationLog> retNotificationLog = new List<InfoFin.Model.NotificationLog>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("RecipientUserId", recipientUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retNotificationLog = (await connection.QueryAsync<InfoFin.Model.NotificationLog>("dbo.zgen_NotificationLog_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retNotificationLog;
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIdsPaging(int? spendRequestId, int? recipientUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.NotificationLog> retNotificationLog = new List<InfoFin.Model.NotificationLog>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("RecipientUserId", recipientUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retNotificationLog = (await connection.QueryAsync<InfoFin.Model.NotificationLog>("dbo.zgen_NotificationLog_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retNotificationLog;
        }

        public async Task<InfoFin.Model.NotificationLog> InsUpdNotificationLog(InfoFin.Model.NotificationLog notificationLog)
        {
            InfoFin.Model.NotificationLog retNotificationLog;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", notificationLog.SpendRequestId);
            dParams.Add("RecipientUserId", notificationLog.RecipientUserId);
            dParams.Add("TriggerStatus", notificationLog.TriggerStatus);
            if (notificationLog.IsSuccessful != null)
                dParams.Add("IsSuccessful", notificationLog.IsSuccessful);
            if (notificationLog.Id != null)
                dParams.Add("Id", notificationLog.Id);
            if (notificationLog.IsActive != null)
                dParams.Add("IsActive", notificationLog.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retNotificationLog = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.NotificationLog>("dbo.zgen_NotificationLog_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retNotificationLog;
        }
    }
}