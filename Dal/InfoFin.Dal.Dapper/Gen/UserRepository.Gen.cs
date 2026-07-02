using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class UserRepository : BaseRepository, IUserRepository
    {
        public UserRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelUserHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_User_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelUserSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_User_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.User>> GetUserById(int? id, bool? isActive)
        {
            List<InfoFin.Model.User> retUser = new List<InfoFin.Model.User>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retUser = (await connection.QueryAsync<InfoFin.Model.User>("dbo.zgen_User_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retUser;
        }

        public async Task<List<InfoFin.Model.User>> GetUserByIds(int? roleId, int? departmentId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.User> retUser = new List<InfoFin.Model.User>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("RoleId", roleId);
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retUser = (await connection.QueryAsync<InfoFin.Model.User>("dbo.zgen_User_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retUser;
        }

        public async Task<List<InfoFin.Model.User>> GetUserByIdsPaging(int? roleId, int? departmentId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.User> retUser = new List<InfoFin.Model.User>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("RoleId", roleId);
            dParams.Add("DepartmentId", departmentId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retUser = (await connection.QueryAsync<InfoFin.Model.User>("dbo.zgen_User_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retUser;
        }

        public async Task<InfoFin.Model.User> InsUpdUser(InfoFin.Model.User user)
        {
            InfoFin.Model.User retUser;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Email", user.Email);
            dParams.Add("PasswordHash", user.PasswordHash);
            dParams.Add("RoleId", user.RoleId);
            if (user.Id != null)
                dParams.Add("Id", user.Id);
            if (user.DepartmentId != null)
                dParams.Add("DepartmentId", user.DepartmentId);
            dParams.Add("IsActive", user.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retUser = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.User>("dbo.zgen_User_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retUser;
        }
    }
}