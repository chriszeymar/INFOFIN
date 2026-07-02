using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class CategoryRepository : BaseRepository, ICategoryRepository
    {
        public CategoryRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelCategoryHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Category_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelCategorySft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Category_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Category> retCategory = new List<InfoFin.Model.Category>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retCategory = (await connection.QueryAsync<InfoFin.Model.Category>("dbo.zgen_Category_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retCategory;
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Category> retCategory = new List<InfoFin.Model.Category>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("FinancialGroupId", financialGroupId);
            dParams.Add("ClassificationId", classificationId);
            dParams.Add("IsActive", isActive);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retCategory = (await connection.QueryAsync<InfoFin.Model.Category>("dbo.zgen_Category_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retCategory;
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            List<InfoFin.Model.Category> retCategory = new List<InfoFin.Model.Category>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("FinancialGroupId", financialGroupId);
            dParams.Add("ClassificationId", classificationId);
            dParams.Add("IsActive", isActive);
            dParams.Add("PageNumber", pageNumber);
            dParams.Add("PageSize", pageSize);
            dParams.Add("SortDirection", sortDirection);
            using (SqlConnection connection = GetConnection())
            {
                retCategory = (await connection.QueryAsync<InfoFin.Model.Category>("dbo.zgen_Category_GetByIdsPaging", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retCategory;
        }

        public async Task<InfoFin.Model.Category> InsUpdCategory(InfoFin.Model.Category category)
        {
            InfoFin.Model.Category retCategory;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", category.Name);
            dParams.Add("FinancialGroupId", category.FinancialGroupId);
            if (category.Id != null)
                dParams.Add("Id", category.Id);
            if (category.ClassificationId != null)
                dParams.Add("ClassificationId", category.ClassificationId);
            dParams.Add("IsActive", category.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retCategory = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Category>("dbo.zgen_Category_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retCategory;
        }
    }
}