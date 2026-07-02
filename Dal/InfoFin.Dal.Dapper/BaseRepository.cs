using Microsoft.Data.SqlClient;

namespace InfoFin.Dal.Dapper
{
	public partial class BaseRepository
	{
		private string _connectionString;
		public BaseRepository(string connectionString)
		{
			_connectionString = connectionString;
		}
		protected SqlConnection GetConnection()
		{
			return new SqlConnection(_connectionString);
		}
	}
}
