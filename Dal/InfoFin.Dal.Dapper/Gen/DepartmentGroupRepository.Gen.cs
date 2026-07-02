using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class DepartmentGroupRepository : BaseRepository, IDepartmentGroupRepository
    {
        public DepartmentGroupRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelDepartmentGroupHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_DepartmentGroup_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelDepartmentGroupSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_DepartmentGroup_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupById(int? id, bool? isActive)
        {
            List<InfoFin.Model.DepartmentGroup> retDepartmentGroup = new List<InfoFin.Model.DepartmentGroup>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retDepartmentGroup = (await connection.QueryAsync<InfoFin.Model.DepartmentGroup>("dbo.zgen_DepartmentGroup_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartmentGroup;
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIds(int? bucketTypeId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.DepartmentGroup> retDepartmentGroup = new List<InfoFin.Model.DepartmentGroup>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("BucketTypeId", bucketTypeId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retDepartmentGroup = (await connection.QueryAsync<InfoFin.Model.DepartmentGroup>("dbo.zgen_DepartmentGroup_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartmentGroup;
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIdsPaging(int? bucketTypeId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.DepartmentGroup> retDepartmentGroup = new List<InfoFin.Model.DepartmentGroup>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("BucketTypeId", bucketTypeId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retDepartmentGroup = (await connection.QueryAsync<InfoFin.Model.DepartmentGroup>("dbo.zgen_DepartmentGroup_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartmentGroup;
        }

        public async Task<InfoFin.Model.DepartmentGroup> InsUpdDepartmentGroup(InfoFin.Model.DepartmentGroup departmentGroup)
        {
            InfoFin.Model.DepartmentGroup retDepartmentGroup;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", departmentGroup.Name);
            dParams.Add("BucketTypeId", departmentGroup.BucketTypeId);
            if (departmentGroup.Id != null)
                dParams.Add("Id", departmentGroup.Id);
            dParams.Add("IsActive", departmentGroup.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retDepartmentGroup = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.DepartmentGroup>("dbo.zgen_DepartmentGroup_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retDepartmentGroup;
        }
    }
}