using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class DepartmentRepository : BaseRepository, IDepartmentRepository
    {
        public DepartmentRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelDepartmentHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Department_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelDepartmentSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Department_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Department> retDepartment = new List<InfoFin.Model.Department>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retDepartment = (await connection.QueryAsync<InfoFin.Model.Department>("dbo.zgen_Department_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartment;
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentByIds(int? departmentGroupId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Department> retDepartment = new List<InfoFin.Model.Department>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentGroupId", departmentGroupId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retDepartment = (await connection.QueryAsync<InfoFin.Model.Department>("dbo.zgen_Department_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartment;
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentByIdsPaging(int? departmentGroupId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Department> retDepartment = new List<InfoFin.Model.Department>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("DepartmentGroupId", departmentGroupId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retDepartment = (await connection.QueryAsync<InfoFin.Model.Department>("dbo.zgen_Department_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retDepartment;
        }

        public async Task<InfoFin.Model.Department> InsUpdDepartment(InfoFin.Model.Department department)
        {
            InfoFin.Model.Department retDepartment;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", department.Name);
            dParams.Add("DepartmentGroupId", department.DepartmentGroupId);
            if (department.Id != null)
                dParams.Add("Id", department.Id);
            if (department.OdooCompanyId != null)
                dParams.Add("OdooCompanyId", department.OdooCompanyId);
            if (department.IsActive != null)
                dParams.Add("IsActive", department.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retDepartment = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Department>("dbo.zgen_Department_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retDepartment;
        }
    }
}