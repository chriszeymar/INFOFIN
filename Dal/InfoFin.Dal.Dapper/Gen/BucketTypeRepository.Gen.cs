using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class BucketTypeRepository : BaseRepository, IBucketTypeRepository
    {
        public BucketTypeRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelBucketTypeHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_BucketType_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelBucketTypeSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_BucketType_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.BucketType>> GetBucketTypeById(int? id, bool? isActive)
        {
            List<InfoFin.Model.BucketType> retBucketType = new List<InfoFin.Model.BucketType>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retBucketType = (await connection.QueryAsync<InfoFin.Model.BucketType>("dbo.zgen_BucketType_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBucketType;
        }

        public async Task<List<InfoFin.Model.BucketType>> GetBucketTypeByIds(List<int> ids)
        {
            List<InfoFin.Model.BucketType> retBucketType = new List<InfoFin.Model.BucketType>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retBucketType = (await connection.QueryAsync<InfoFin.Model.BucketType>("dbo.zgen_BucketType_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retBucketType;
        }

        public async Task<InfoFin.Model.BucketType> InsUpdBucketType(InfoFin.Model.BucketType bucketType)
        {
            InfoFin.Model.BucketType retBucketType;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", bucketType.Name);
            if (bucketType.Id != null)
                dParams.Add("Id", bucketType.Id);
            dParams.Add("IsActive", bucketType.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retBucketType = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.BucketType>("dbo.zgen_BucketType_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retBucketType;
        }
    }
}