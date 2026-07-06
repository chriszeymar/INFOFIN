using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class OdooJournalLineRepository : BaseRepository, IOdooJournalLineRepository
    {
        public OdooJournalLineRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelOdooJournalLineHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_OdooJournalLine_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelOdooJournalLineSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_OdooJournalLine_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineById(int? id, bool? isActive)
        {
            List<InfoFin.Model.OdooJournalLine> retOdooJournalLine = new List<InfoFin.Model.OdooJournalLine>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retOdooJournalLine = (await connection.QueryAsync<InfoFin.Model.OdooJournalLine>("dbo.zgen_OdooJournalLine_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooJournalLine;
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByIds(List<int> ids)
        {
            List<InfoFin.Model.OdooJournalLine> retOdooJournalLine = new List<InfoFin.Model.OdooJournalLine>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retOdooJournalLine = (await connection.QueryAsync<InfoFin.Model.OdooJournalLine>("dbo.zgen_OdooJournalLine_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooJournalLine;
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByOdooLineId(int? odooLineId)
        {
            List<InfoFin.Model.OdooJournalLine> retOdooJournalLine = new List<InfoFin.Model.OdooJournalLine>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("OdooLineId", odooLineId);
            using (SqlConnection connection = GetConnection())
            {
                retOdooJournalLine = (await connection.QueryAsync<InfoFin.Model.OdooJournalLine>("dbo.zgen_OdooJournalLine_GetByOdooLineId", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retOdooJournalLine;
        }

        public async Task<InfoFin.Model.OdooJournalLine> InsUpdOdooJournalLine(InfoFin.Model.OdooJournalLine odooJournalLine)
        {
            InfoFin.Model.OdooJournalLine retOdooJournalLine;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("OdooLineId", odooJournalLine.OdooLineId);
            dParams.Add("OdooCompanyId", odooJournalLine.OdooCompanyId);
            dParams.Add("OdooAccountId", odooJournalLine.OdooAccountId);
            dParams.Add("Date", odooJournalLine.Date);
            if (odooJournalLine.Debit != null)
                dParams.Add("Debit", odooJournalLine.Debit);
            if (odooJournalLine.Credit != null)
                dParams.Add("Credit", odooJournalLine.Credit);
            dParams.Add("ImportedAt", odooJournalLine.ImportedAt);
            if (odooJournalLine.Id != null)
                dParams.Add("Id", odooJournalLine.Id);
            if (odooJournalLine.OdooCompanyName != null)
                dParams.Add("OdooCompanyName", odooJournalLine.OdooCompanyName);
            if (odooJournalLine.OdooAccountCode != null)
                dParams.Add("OdooAccountCode", odooJournalLine.OdooAccountCode);
            if (odooJournalLine.OdooAccountName != null)
                dParams.Add("OdooAccountName", odooJournalLine.OdooAccountName);
            if (odooJournalLine.State != null)
                dParams.Add("State", odooJournalLine.State);
            if (odooJournalLine.OdooWriteDate != null)
                dParams.Add("OdooWriteDate", odooJournalLine.OdooWriteDate);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retOdooJournalLine = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.OdooJournalLine>("dbo.zgen_OdooJournalLine_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retOdooJournalLine;
        }
    }
}