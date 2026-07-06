using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class FinancialGroupRepository : BaseRepository, IFinancialGroupRepository
    {
        public FinancialGroupRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelFinancialGroupHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_FinancialGroup_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelFinancialGroupSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_FinancialGroup_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupById(int? id, bool? isActive)
        {
            List<InfoFin.Model.FinancialGroup> retFinancialGroup = new List<InfoFin.Model.FinancialGroup>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retFinancialGroup = (await connection.QueryAsync<InfoFin.Model.FinancialGroup>("dbo.zgen_FinancialGroup_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retFinancialGroup;
        }

        public async Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupByIds(List<int> ids)
        {
            List<InfoFin.Model.FinancialGroup> retFinancialGroup = new List<InfoFin.Model.FinancialGroup>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retFinancialGroup = (await connection.QueryAsync<InfoFin.Model.FinancialGroup>("dbo.zgen_FinancialGroup_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retFinancialGroup;
        }

        public async Task<InfoFin.Model.FinancialGroup> InsUpdFinancialGroup(InfoFin.Model.FinancialGroup financialGroup)
        {
            InfoFin.Model.FinancialGroup retFinancialGroup;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", financialGroup.Name);
            if (financialGroup.Id != null)
                dParams.Add("Id", financialGroup.Id);
            if (financialGroup.IsActive != null)
                dParams.Add("IsActive", financialGroup.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retFinancialGroup = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.FinancialGroup>("dbo.zgen_FinancialGroup_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retFinancialGroup;
        }
    }
}