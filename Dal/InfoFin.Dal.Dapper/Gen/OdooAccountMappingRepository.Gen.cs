using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class OdooAccountMappingRepository : BaseRepository, IOdooAccountMappingRepository
    {
        public OdooAccountMappingRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelOdooAccountMappingHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_OdooAccountMapping_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelOdooAccountMappingSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_OdooAccountMapping_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingById(int? id, bool? isActive)
        {
            List<InfoFin.Model.OdooAccountMapping> retOdooAccountMapping = new List<InfoFin.Model.OdooAccountMapping>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retOdooAccountMapping = (await connection.QueryAsync<InfoFin.Model.OdooAccountMapping>("dbo.zgen_OdooAccountMapping_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooAccountMapping;
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIds(int? infoFinCategoryId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.OdooAccountMapping> retOdooAccountMapping = new List<InfoFin.Model.OdooAccountMapping>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("InfoFinCategoryId", infoFinCategoryId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retOdooAccountMapping = (await connection.QueryAsync<InfoFin.Model.OdooAccountMapping>("dbo.zgen_OdooAccountMapping_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooAccountMapping;
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIdsPaging(int? infoFinCategoryId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.OdooAccountMapping> retOdooAccountMapping = new List<InfoFin.Model.OdooAccountMapping>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("InfoFinCategoryId", infoFinCategoryId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retOdooAccountMapping = (await connection.QueryAsync<InfoFin.Model.OdooAccountMapping>("dbo.zgen_OdooAccountMapping_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooAccountMapping;
        }

        public async Task<InfoFin.Model.OdooAccountMapping> InsUpdOdooAccountMapping(InfoFin.Model.OdooAccountMapping odooAccountMapping)
        {
            InfoFin.Model.OdooAccountMapping retOdooAccountMapping;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("OdooAccountCode", odooAccountMapping.OdooAccountCode);
            dParams.Add("OdooAccountName", odooAccountMapping.OdooAccountName);
            dParams.Add("InfoFinCategoryId", odooAccountMapping.InfoFinCategoryId);
            if (odooAccountMapping.Id != null)
                dParams.Add("Id", odooAccountMapping.Id);
            if (odooAccountMapping.IsActive != null)
                dParams.Add("IsActive", odooAccountMapping.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retOdooAccountMapping = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.OdooAccountMapping>("dbo.zgen_OdooAccountMapping_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retOdooAccountMapping;
        }
    }
}