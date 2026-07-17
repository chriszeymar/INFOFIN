using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class AccountRepository : BaseRepository, IAccountRepository
    {
        public AccountRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelAccountHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Account_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelAccountSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Account_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Account> retAccount = new List<InfoFin.Model.Account>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retAccount = (await connection.QueryAsync<InfoFin.Model.Account>("dbo.zgen_Account_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retAccount;
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Account> retAccount = new List<InfoFin.Model.Account>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("FinancialGroupId", financialGroupId);
            dParams.Add("ClassificationId", classificationId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retAccount = (await connection.QueryAsync<InfoFin.Model.Account>("dbo.zgen_Account_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retAccount;
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Account> retAccount = new List<InfoFin.Model.Account>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("FinancialGroupId", financialGroupId);
            dParams.Add("ClassificationId", classificationId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retAccount = (await connection.QueryAsync<InfoFin.Model.Account>("dbo.zgen_Account_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retAccount;
        }

        public async Task<InfoFin.Model.Account> InsUpdAccount(InfoFin.Model.Account account)
        {
            InfoFin.Model.Account retAccount;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", account.Name);
            dParams.Add("FinancialGroupId", account.FinancialGroupId);
            if (account.Id != null)
                dParams.Add("Id", account.Id);
            if (account.ClassificationId != null)
                dParams.Add("ClassificationId", account.ClassificationId);
            if (account.OdooAccountId != null)
                dParams.Add("OdooAccountId", account.OdooAccountId);
            if (account.OdooAccountCode != null)
                dParams.Add("OdooAccountCode", account.OdooAccountCode);
            if (account.OdooAccountType != null)
                dParams.Add("OdooAccountType", account.OdooAccountType);
            if (account.IsActive != null)
                dParams.Add("IsActive", account.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retAccount = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Account>("dbo.zgen_Account_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retAccount;
        }
    }
}