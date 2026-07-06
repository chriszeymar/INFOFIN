using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class ClassificationRepository : BaseRepository, IClassificationRepository
    {
        public ClassificationRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelClassificationHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Classification_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelClassificationSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Classification_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Classification>> GetClassificationById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Classification> retClassification = new List<InfoFin.Model.Classification>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retClassification = (await connection.QueryAsync<InfoFin.Model.Classification>("dbo.zgen_Classification_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retClassification;
        }

        public async Task<List<InfoFin.Model.Classification>> GetClassificationByIds(List<int> ids)
        {
            List<InfoFin.Model.Classification> retClassification = new List<InfoFin.Model.Classification>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retClassification = (await connection.QueryAsync<InfoFin.Model.Classification>("dbo.zgen_Classification_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retClassification;
        }

        public async Task<InfoFin.Model.Classification> InsUpdClassification(InfoFin.Model.Classification classification)
        {
            InfoFin.Model.Classification retClassification;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", classification.Name);
            if (classification.Id != null)
                dParams.Add("Id", classification.Id);
            if (classification.IsActive != null)
                dParams.Add("IsActive", classification.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retClassification = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Classification>("dbo.zgen_Classification_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retClassification;
        }
    }
}