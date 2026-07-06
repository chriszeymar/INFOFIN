using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class SpendRequestRepository : BaseRepository, ISpendRequestRepository
    {
        public SpendRequestRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelSpendRequestHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequest_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelSpendRequestSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_SpendRequest_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestById(int? id, bool? isActive)
        {
            List<InfoFin.Model.SpendRequest> retSpendRequest = new List<InfoFin.Model.SpendRequest>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequest = (await connection.QueryAsync<InfoFin.Model.SpendRequest>("dbo.zgen_SpendRequest_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequest;
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIds(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? assignedToUserId, int? vendorId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequest> retSpendRequest = new List<InfoFin.Model.SpendRequest>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("CategoryId", categoryId);
            dParams.Add("EncoderId", encoderId);
            dParams.Add("CurrencyId", currencyId);
            dParams.Add("AssignedToUserId", assignedToUserId);
            dParams.Add("VendorId", vendorId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequest = (await connection.QueryAsync<InfoFin.Model.SpendRequest>("dbo.zgen_SpendRequest_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequest;
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIdsPaging(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? assignedToUserId, int? vendorId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.SpendRequest> retSpendRequest = new List<InfoFin.Model.SpendRequest>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("CategoryId", categoryId);
            dParams.Add("EncoderId", encoderId);
            dParams.Add("CurrencyId", currencyId);
            dParams.Add("AssignedToUserId", assignedToUserId);
            dParams.Add("VendorId", vendorId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequest = (await connection.QueryAsync<InfoFin.Model.SpendRequest>("dbo.zgen_SpendRequest_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retSpendRequest;
        }

        public async Task<InfoFin.Model.SpendRequest> InsUpdSpendRequest(InfoFin.Model.SpendRequest spendRequest)
        {
            InfoFin.Model.SpendRequest retSpendRequest;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("ReferenceNumber", spendRequest.ReferenceNumber);
            dParams.Add("DepartmentId", spendRequest.DepartmentId);
            dParams.Add("CategoryId", spendRequest.CategoryId);
            dParams.Add("EncoderId", spendRequest.EncoderId);
            dParams.Add("Amount", spendRequest.Amount);
            dParams.Add("CurrencyId", spendRequest.CurrencyId);
            dParams.Add("LockedExchangeRate", spendRequest.LockedExchangeRate);
            dParams.Add("Description", spendRequest.Description);
            dParams.Add("Status", spendRequest.Status);
            if (spendRequest.Id != null)
                dParams.Add("Id", spendRequest.Id);
            if (spendRequest.AssignedToUserId != null)
                dParams.Add("AssignedToUserId", spendRequest.AssignedToUserId);
            if (spendRequest.VendorId != null)
                dParams.Add("VendorId", spendRequest.VendorId);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retSpendRequest = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.SpendRequest>("dbo.zgen_SpendRequest_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retSpendRequest;
        }
    }
}