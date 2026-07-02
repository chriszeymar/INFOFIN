using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class CurrencyRepository : BaseRepository, ICurrencyRepository
    {
        public CurrencyRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelCurrencyHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Currency_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelCurrencySft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Currency_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Currency>> GetCurrencyById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Currency> retCurrency = new List<InfoFin.Model.Currency>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retCurrency = (await connection.QueryAsync<InfoFin.Model.Currency>("dbo.zgen_Currency_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retCurrency;
        }

        public async Task<List<InfoFin.Model.Currency>> GetCurrencyByIds(List<int> ids)
        {
            List<InfoFin.Model.Currency> retCurrency = new List<InfoFin.Model.Currency>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retCurrency = (await connection.QueryAsync<InfoFin.Model.Currency>("dbo.zgen_Currency_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retCurrency;
        }

        public async Task<InfoFin.Model.Currency> InsUpdCurrency(InfoFin.Model.Currency currency)
        {
            InfoFin.Model.Currency retCurrency;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Code", currency.Code);
            dParams.Add("ExchangeRateToUSD", currency.ExchangeRateToUSD);
            if (currency.Id != null)
                dParams.Add("Id", currency.Id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retCurrency = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Currency>("dbo.zgen_Currency_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retCurrency;
        }
    }
}