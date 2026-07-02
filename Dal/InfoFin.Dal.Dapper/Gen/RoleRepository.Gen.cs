using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class RoleRepository : BaseRepository, IRoleRepository
    {
        public RoleRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelRoleHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Role_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelRoleSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Role_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Role>> GetRoleById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Role> retRole = new List<InfoFin.Model.Role>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retRole = (await connection.QueryAsync<InfoFin.Model.Role>("dbo.zgen_Role_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retRole;
        }

        public async Task<List<InfoFin.Model.Role>> GetRoleByIds(List<int> ids)
        {
            List<InfoFin.Model.Role> retRole = new List<InfoFin.Model.Role>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retRole = (await connection.QueryAsync<InfoFin.Model.Role>("dbo.zgen_Role_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retRole;
        }

        public async Task<InfoFin.Model.Role> InsUpdRole(InfoFin.Model.Role role)
        {
            InfoFin.Model.Role retRole;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", role.Name);
            if (role.Id != null)
                dParams.Add("Id", role.Id);
            dParams.Add("IsActive", role.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retRole = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Role>("dbo.zgen_Role_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retRole;
        }
    }
}