using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper.Utils;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace InfoFin.Dal.Dapper
{
    public partial class VendorRepository : BaseRepository, IVendorRepository
    {
        public VendorRepository(string connectionString) : base(connectionString)
        {
        }

        public async Task DelVendorHrd(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Vendor_DelHrd", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task DelVendorSft(int id)
        {
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                await connection.ExecuteAsync("dbo.zgen_Vendor_DelSft", dParams, commandType: System.Data.CommandType.StoredProcedure);
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }
        }

        public async Task<List<InfoFin.Model.Vendor>> GetVendorById(int? id, bool? isActive)
        {
            List<InfoFin.Model.Vendor> retVendor = new List<InfoFin.Model.Vendor>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Id", id);
            dParams.Add("IsActive", isActive);
            using (SqlConnection connection = GetConnection())
            {
                retVendor = (await connection.QueryAsync<InfoFin.Model.Vendor>("dbo.zgen_Vendor_GetById", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retVendor;
        }

        public async Task<List<InfoFin.Model.Vendor>> GetVendorByIds(List<int> ids)
        {
            List<InfoFin.Model.Vendor> retVendor = new List<InfoFin.Model.Vendor>();
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Ids", ids.ToDataTable().AsTableValuedParameter("dbo.udtt_Ints"));
            using (SqlConnection connection = GetConnection())
            {
                retVendor = (await connection.QueryAsync<InfoFin.Model.Vendor>("dbo.zgen_Vendor_GetByIds", dParams, commandType: System.Data.CommandType.StoredProcedure)).AsList();
            }

            return retVendor;
        }

        public async Task<InfoFin.Model.Vendor> InsUpdVendor(InfoFin.Model.Vendor vendor)
        {
            InfoFin.Model.Vendor retVendor;
            DynamicParameters dParams = new DynamicParameters();
            dParams.Add("Name", vendor.Name);
            if (vendor.Id != null)
                dParams.Add("Id", vendor.Id);
            dParams.Add("IsActive", vendor.IsActive);
            dParams.Add("RetMsg", string.Empty, dbType: DbType.String, direction: ParameterDirection.Output);
            dParams.Add("RetVal", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
            using (SqlConnection connection = GetConnection())
            {
                retVendor = (await connection.QueryFirstOrDefaultAsync<InfoFin.Model.Vendor>("dbo.zgen_Vendor_InsUpd", dParams, commandType: System.Data.CommandType.StoredProcedure));
            }

            string retMsg = dParams.Get<string>("RetMsg");
            int retVal = dParams.Get<int>("RetVal");
            if (retVal == 1)
            {
                throw new Exception(retMsg);
            }

            return retVendor;
        }
    }
}