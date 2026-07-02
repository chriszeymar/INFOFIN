using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class SpendRequestAttachmentRepository : BaseRepository, ISpendRequestAttachmentRepository
    {
        public SpendRequestAttachmentRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelSpendRequestAttachmentHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequestAttachment_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelSpendRequestAttachmentSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequestAttachment_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentById(int? id, bool? isActive)
        {
            List<InfoFin.Model.SpendRequestAttachment> retSpendRequestAttachment = new List<InfoFin.Model.SpendRequestAttachment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestAttachment = (await connection.QueryAsync<InfoFin.Model.SpendRequestAttachment>("dbo.zgen_SpendRequestAttachment_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestAttachment;
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIds(int? spendRequestId, int? uploadedByUserId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequestAttachment> retSpendRequestAttachment = new List<InfoFin.Model.SpendRequestAttachment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("UploadedByUserId", uploadedByUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestAttachment = (await connection.QueryAsync<InfoFin.Model.SpendRequestAttachment>("dbo.zgen_SpendRequestAttachment_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestAttachment;
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIdsPaging(int? spendRequestId, int? uploadedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequestAttachment> retSpendRequestAttachment = new List<InfoFin.Model.SpendRequestAttachment>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestId);
            dParams.Add("UploadedByUserId", uploadedByUserId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestAttachment = (await connection.QueryAsync<InfoFin.Model.SpendRequestAttachment>("dbo.zgen_SpendRequestAttachment_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequestAttachment;
        }

        public async Task<InfoFin.Model.SpendRequestAttachment> InsUpdSpendRequestAttachment(InfoFin.Model.SpendRequestAttachment spendRequestAttachment)
        {
            InfoFin.Model.SpendRequestAttachment retSpendRequestAttachment;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("SpendRequestId", spendRequestAttachment.SpendRequestId);
            dParams.Add("FileUrl", spendRequestAttachment.FileUrl);
            dParams.Add("FileName", spendRequestAttachment.FileName);
            dParams.Add("UploadedByUserId", spendRequestAttachment.UploadedByUserId);
            if (spendRequestAttachment.Id != null)
                dParams.Add("Id", spendRequestAttachment.Id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequestAttachment = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.SpendRequestAttachment>("dbo.zgen_SpendRequestAttachment_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retSpendRequestAttachment;
        }
    }
}